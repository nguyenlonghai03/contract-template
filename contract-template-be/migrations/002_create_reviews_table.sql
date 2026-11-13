CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_reviews_contract_id ON reviews(contract_id);