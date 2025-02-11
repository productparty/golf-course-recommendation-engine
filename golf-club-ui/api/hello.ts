import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../src/supabaseClient'; // Import your Supabase client

export default async (req: VercelRequest, res: VercelResponse) => {
  console.log('Hello from serverless function!'); // This will show in Vercel logs

  try {
    const { data, error } = await supabase.from('some_table').select('*');
    console.log('Supabase data:', data);
    console.log('Supabase error:', error);

    res.status(200).json({ message: 'Hello!', data });
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}; 