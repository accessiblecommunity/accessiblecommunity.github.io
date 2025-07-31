const { TableClient } = require("@azure/data-tables");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

module.exports = async function (context, req) {
    try {
        // Validate input
        const sessionId = req.body.sessionId;
        const purchaseData = req.body.purchaseData;
        
        if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
            context.res = {
                status: 400,
                body: JSON.stringify({ error: "Invalid session ID format" })
            };
            return;
        }

        // Generate secure proof code
        const proofCode = generateSecureProofCode();
        
        // Store in Azure Table
        await storeInTableStorage(sessionId, purchaseData, proofCode);

        context.res = {
            status: 200,
            body: JSON.stringify({ proofCode }),
            headers: { "Content-Type": "application/json" }
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function generateSecureProofCode() {
    // Generate crypto-secure token
    const randomBytes = crypto.randomBytes(24);
    const token = randomBytes.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return `AER-${token}`;
}

async function storeInTableStorage(sessionId, purchaseData, proofCode) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const tableName = "PurchaseProofs";
    const client = TableClient.fromConnectionString(connectionString, tableName);
    
    // Create table if not exists
    try {
        await client.createTable();
    } catch (e) {
        if (e.statusCode !== 409) throw e; // Ignore "already exists" errors
    }

    const entity = {
        partitionKey: "proof",
        rowKey: proofCode,  // Use proofCode as rowKey for fast lookup
        sessionId,
        purchaseData: JSON.stringify(purchaseData),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };

    await client.upsertEntity(entity, "Replace");
}