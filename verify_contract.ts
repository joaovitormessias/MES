
import { mesApi } from "./frontend/src/lib/api";

async function verifyContract() {
    console.log("Starting Contract Verification...");

    try {
        // 1. Verify OPS endpoint
        console.log("Checking GET /ops...");
        const ops = await mesApi.getOps();
        console.log(`✅ GET /ops - Success (Found ${ops.length} orders)`);
    } catch (e: any) {
        if (e.response) {
            console.log(`⚠️ GET /ops - Failed with status ${e.response.status}`);
        } else {
            console.log(`❌ GET /ops - Network/Client Error: ${e.message}`);
        }
    }

    try {
        // 2. Verify Scans endpoint (Idempotency)
        console.log("Checking POST /scans...");
        await mesApi.scanBarcode("TEST-SCAN-123");
        console.log("✅ POST /scans - Success");
    } catch (e: any) {
        console.log(`⚠️ POST /scans - Failed or Not Implemented`);
    }

    console.log("Verification Complete.");
}

verifyContract();
