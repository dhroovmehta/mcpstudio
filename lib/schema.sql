-- MCPStudio Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'professional', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MCP Servers
CREATE TABLE IF NOT EXISTS mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',
  generated_code TEXT,
  deployment_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'deployed', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tools (within each server)
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  api_config JSONB DEFAULT '{}',
  input_schema JSONB DEFAULT '{"type": "object", "properties": {}}',
  output_mapping JSONB DEFAULT '{"fields": []}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deployments
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  vercel_deployment_id TEXT,
  version TEXT,
  status TEXT CHECK (status IN ('building', 'ready', 'error')),
  deployment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage analytics
CREATE TABLE IF NOT EXISTS tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES mcp_servers(id),
  tool_id UUID REFERENCES tools(id),
  calls_count INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_servers_user ON mcp_servers(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_server ON tools(server_id);
CREATE INDEX IF NOT EXISTS idx_deployments_server ON deployments(server_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_server ON tool_usage(server_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_date ON tool_usage(date);

-- Row Level Security (RLS)
ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access their own data)
CREATE POLICY "Users can view own servers" ON mcp_servers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create servers" ON mcp_servers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own servers" ON mcp_servers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own servers" ON mcp_servers
  FOR DELETE USING (auth.uid() = user_id);

-- Tools inherit server ownership
CREATE POLICY "Users can view own tools" ON tools
  FOR SELECT USING (
    server_id IN (SELECT id FROM mcp_servers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own tools" ON tools
  FOR ALL USING (
    server_id IN (SELECT id FROM mcp_servers WHERE user_id = auth.uid())
  );

-- Deployments inherit server ownership
CREATE POLICY "Users can view own deployments" ON deployments
  FOR SELECT USING (
    server_id IN (SELECT id FROM mcp_servers WHERE user_id = auth.uid())
  );

-- Usage inherit server ownership
CREATE POLICY "Users can view own usage" ON tool_usage
  FOR SELECT USING (
    server_id IN (SELECT id FROM mcp_servers WHERE user_id = auth.uid())
  );
