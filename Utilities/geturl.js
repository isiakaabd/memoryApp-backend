import 'dotenv/config'
export const getUrl = () => {
  if (process.env.NODE_ENV === '') return 'http://localhost:3000'
  return 'https://remlad-memory-app.netlify.app'
}
