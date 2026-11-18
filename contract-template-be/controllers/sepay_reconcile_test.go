package controllers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestParseSePayAmount(t *testing.T) {
	tests := []struct {
		in     string
		want   int64
		wantOK bool
	}{
		{"150000.00", 150000, true},
		{"150000", 150000, true},
		{" 99000.00 ", 99000, true},
		{"0.00", 0, true},
		{"150000.50", 0, false},
		{"", 0, false},
		{"abc", 0, false},
	}

	for _, tt := range tests {
		got, ok := parseSePayAmount(tt.in)
		if got != tt.want || ok != tt.wantOK {
			t.Errorf("parseSePayAmount(%q) = (%d, %v), want (%d, %v)", tt.in, got, ok, tt.want, tt.wantOK)
		}
	}
}

func TestToSePayTransaction(t *testing.T) {
	in := sepayAPITransaction{
		ID:                 "92704",
		BankBrandName:      "TPBank",
		AccountNumber:      "04494162701",
		TransactionDate:    "2026-11-18 10:15:00",
		AmountIn:           "150000.00",
		AmountOut:          "0.00",
		TransactionContent: "HDAB12CD34EF56 thanh toan",
		ReferenceNumber:    "FT26322ABC",
	}

	got, ok := toSePayTransaction(in)
	if !ok {
		t.Fatal("expected incoming transaction to be accepted")
	}
	if got.SePayID != 92704 || got.TransferAmount != 150000 || got.ReferenceCode != "FT26322ABC" ||
		got.AccountNumber != "04494162701" || got.Content != in.TransactionContent || got.Gateway != "TPBank" {
		t.Errorf("unexpected conversion: %+v", got)
	}

	out := in
	out.AmountIn, out.AmountOut = "0.00", "150000.00"
	if _, ok := toSePayTransaction(out); ok {
		t.Error("outgoing transaction must be skipped")
	}

	bad := in
	bad.ID = "not-a-number"
	if _, ok := toSePayTransaction(bad); ok {
		t.Error("invalid id must be skipped")
	}
}

func TestFetchTransactions(t *testing.T) {
	var gotAuth, gotAccount, gotSince string

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/userapi/transactions/list" {
			http.NotFound(w, r)
			return
		}
		gotAuth = r.Header.Get("Authorization")
		gotAccount = r.URL.Query().Get("account_number")
		gotSince = r.URL.Query().Get("transaction_date_min")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":200,"error":null,"messages":{"success":true},"transactions":[
			{"id":"1","account_number":"123","transaction_date":"2026-11-18 10:00:00","amount_in":"50000.00","amount_out":"0.00","transaction_content":"HDAB12CD34EF56","reference_number":"R1"}
		]}`))
	}))
	defer srv.Close()

	now := time.Date(2026, 11, 18, 3, 0, 0, 0, time.UTC) // 10:00 giờ VN
	r := &sepayReconciler{
		client:   srv.Client(),
		baseURL:  srv.URL,
		token:    "tok",
		account:  "123",
		lookback: 24 * time.Hour,
		now:      func() time.Time { return now },
	}

	txs, err := r.fetchTransactions(context.Background())
	if err != nil {
		t.Fatalf("fetchTransactions: %v", err)
	}
	if len(txs) != 1 || txs[0].ID != "1" {
		t.Fatalf("unexpected transactions: %+v", txs)
	}
	if gotAuth != "Bearer tok" {
		t.Errorf("Authorization = %q", gotAuth)
	}
	if gotAccount != "123" {
		t.Errorf("account_number = %q", gotAccount)
	}
	if gotSince != "2026-11-17 10:00:00" {
		t.Errorf("transaction_date_min = %q, want Vietnam time 24h earlier", gotSince)
	}
}

func TestFetchTransactionsHTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
	}))
	defer srv.Close()

	r := &sepayReconciler{
		client:   srv.Client(),
		baseURL:  srv.URL,
		lookback: time.Hour,
		now:      time.Now,
	}

	if _, err := r.fetchTransactions(context.Background()); err == nil {
		t.Fatal("expected error on HTTP 401")
	}
}
