-- Participant table
CREATE TABLE participant (
    participant_id BIGSERIAL PRIMARY KEY,
    participant_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);