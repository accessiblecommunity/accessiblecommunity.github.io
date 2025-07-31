const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  context.log('=== save-purchase-data START ===');

  const connectionString = process.env["AZURE_STORAGE_CONNECTION_STRING"];
  if (!connectionString) {
    context.log.error("Missing AZURE_STORAGE_CONNECTION_STRING");
    context.res = { status: 500, body: "ERROR: AZURE_STORAGE_CONNECTION_STRING not configured." };
    context.log('=== save-purchase-data END ===');
    return;
  }
  context.log("Connection string OK");

  let client;
  try {
    client = TableClient.fromConnectionString(connectionString, "Purchases");
    context.log("TableClient created");
  } catch (err) {
    context.log.error("TableClient creation FAILED:", err.message);
    context.res = { status: 500, body: "ERROR: Could not create TableClient." };
    context.log('=== save-purchase-data END ===');
    return;
  }

  const purchase = req.body;
  context.log("Request body:", JSON.stringify(purchase));

  if (!purchase || typeof purchase !== "object") {
    context.res = { status: 400, body: "ERROR: Request body must be JSON." };
    context.log('=== save-purchase-data END ===');
    return;
  }

  if (!purchase.id || !purchase.customerEmail) {
    context.res = { status: 400, body: "ERROR: 'id' and 'customerEmail' fields are required." };
    context.log('=== save-purchase-data END ===');
    return;
  }

    const entity = {
    partitionKey: String(purchase.customerEmail),  // lowercase 'p'
    rowKey: String(purchase.id),                  // lowercase 'r'
    paymentStatus: purchase.paymentStatus || "unknown",
    amountTotal: purchase.amountTotal ?? 0,
    currency: purchase.currency || "usd",
    created: purchase.created || new Date().toISOString()
    };

  context.log("Prepared entity:", JSON.stringify(entity));
  context.log(`PartitionKey: '${entity.PartitionKey}' (type: ${typeof entity.PartitionKey})`);
  context.log(`RowKey: '${entity.RowKey}' (type: ${typeof entity.RowKey})`);
  context.log("Entity keys:", Object.keys(entity));

  // Simple test upsert to isolate problem
  try {
    await client.upsertEntity({
        partitionKey: "test-partition",  // lowercase
        rowKey: "test-row"               // lowercase
        }, "Merge");
    context.log("Simple test upsert succeeded");
  } catch (err) {
    context.log.error("Simple test upsert FAILED:", err.message);
  }

  try {
    // Try with forced serialization as a last resort
    await client.upsertEntity(JSON.parse(JSON.stringify(entity)), "Merge");
    context.log("Upsert successful");
    context.res = {
      status: 200,
      body: { message: "Purchase saved.", entity }
    };
  } catch (err) {
    context.log.error("Upsert FAILED:", err.message);
    context.res = {
      status: 500,
      body: "ERROR: Failed to save purchase."
    };
  }

  context.log('=== save-purchase-data END ===');
};
