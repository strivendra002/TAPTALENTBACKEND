CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id STRING UNIQUE NOT NULL,
    status STRING NOT NULL CHECK (
        status IN ('searching', 'chatting', 'disconnected')
    ),
    partner_id UUID NULL,
    connected_at TIMESTAMPTZ DEFAULT now(),
    last_activity TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ NULL,
    ended_by UUID NULL,
    CONSTRAINT no_self_chat CHECK (user1_id <> user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message STRING NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_connection ON users(connection_id);
CREATE INDEX IF NOT EXISTS idx_chat_active ON chat_sessions(ended_at);
CREATE INDEX IF NOT EXISTS idx_user_time ON messages(user_id, created_at);