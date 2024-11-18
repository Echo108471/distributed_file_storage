import { createHelia } from 'helia'; // Check if 'createHelia' is exported
import { MemoryBlockstore } from 'blockstore-core'; // For in-memory block storage
import { unixfs, UnixFS } from '@helia/unixfs';
import { CID } from 'multiformats/cid';


if (typeof CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent extends Event {
    detail: any;
    constructor(type: string, params: { detail?: any } = {}) {
      super(type, params);
      this.detail = params.detail;
    }
  };
}


// Initialize a Helia node
async function initHelia() {
  const blockstore = new MemoryBlockstore(); // Set up the blockstore for storage

  // Initialize the Helia node
  const helia = await createHelia({ blockstore });
  console.log('Helia node initialized');
  return helia;
}

// Add a file to IPFS and retrieve the CID
async function addFile(helia: any, content: string): Promise<CID> {
    const fs = unixfs(helia); // Initialize UnixFS using Helia instance
  
    // Convert content string to Uint8Array
    const byteContent = new TextEncoder().encode(content);
  
    // Add file content and obtain the CID
    const cid = await fs.addBytes(byteContent);
    
    console.log(`File added with CID: ${cid.toString()}`);
    
    return cid;
  }

// Retrieve a file from IPFS using the CID
async function getFile(helia: any, cid: CID): Promise<string> {
  const fs = unixfs(helia); // Initialize UnixFS instance
  const decoder = new TextDecoder();
  let content = '';

  // Concatenate chunks of data retrieved from IPFS
  for await (const chunk of fs.cat(cid)) {
    content += decoder.decode(chunk, { stream: true });
  }
  console.log(`File content retrieved: ${content}`);
  return content;
}

// Main function to add and retrieve a file
async function main() {
  const helia = await initHelia();
  const content = 'Hello, Helia!';
  
  // Add and then retrieve the file content
  const cid = await addFile(helia, content);
  await getFile(helia, cid);
}

main().catch(console.error);
