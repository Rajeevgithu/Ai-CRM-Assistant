import dbConnect from '../src/lib/mongodb';
import Customer from '../src/models/Customer';

async function main() {
  await dbConnect();
  const customers = await Customer.find({});
  console.log('Total customers:', customers.length);
  customers.forEach((c, i) => {
    console.log(`${i + 1}. Name: ${c.name}, Total Spent: ₹${c.totalSpent}, Active: ${c.isActive}`);
  });
  process.exit(0);
}

main().catch((err) => {
  console.error('Error listing customers:', err);
  process.exit(1);
}); 