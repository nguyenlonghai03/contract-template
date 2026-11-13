package models

import "time"

type CheckoutSession struct {
	ID        string `gorm:"primaryKey;type:varchar(64)"`
	TokenHash string `gorm:"uniqueIndex;not null;type:varchar(64)"`
	CreatedAt time.Time
	ExpiresAt time.Time
}
