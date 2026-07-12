import { seed } from './initial-data.seeder'

seed()
  .then(() => {
    console.log('Seeder finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seeder failed:', error)
    process.exit(1)
  })
