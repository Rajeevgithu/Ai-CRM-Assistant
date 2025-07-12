import dbConnect from '../src/lib/mongodb';
import Customer from '../src/models/Customer';

async function main() {
  await dbConnect();
  const result = await Customer.deleteMany({ name: { $nin: ['Rajeev', 'sumit'] } });
  console.log(`Deleted ${result.deletedCount} customers. Only 'Rajeev' and 'sumit' remain.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error cleaning up customers:', err);
  process.exit(1);
}); 