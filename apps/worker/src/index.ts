import { Hono } from 'hono'
import { createWorkerClient } from '@packages/supabase'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const supabase = createWorkerClient(c.env)
  const { data, error } = await supabase.from('test').select('*').limit(1)
  
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ message: 'Hello Cloudflare Workers!', data })
})

export default app
