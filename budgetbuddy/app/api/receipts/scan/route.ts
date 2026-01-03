import { NextRequest, NextResponse } from "next/server";
import Veryfi from '@veryfi/veryfi-sdk';


export async function POST(request: NextRequest) {
    try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Initialize Veryfi client with credentials
    // You'll need to set these environment variables in .env.local:
    // VERYFI_CLIENT_ID=your_client_id
    // VERYFI_CLIENT_SECRET=your_client_secret
    // VERYFI_USERNAME=your_username
    // VERYFI_API_KEY=your_api_key
    const client = new Veryfi(
      process.env.VERYFI_CLIENT_ID || '',
      process.env.VERYFI_CLIENT_SECRET || '',
      process.env.VERYFI_USERNAME || '',
      process.env.VERYFI_API_KEY || ''
    );

    // Process the document
    const result = await client.process_document_from_base64(
      base64Image,
      file.name
    );

    // Extract key information
    const extractedData = {
      merchant: result.vendor?.name || 'Unknown',
      total: result.total || 0,
      tax: result.tax || 0,
      subtotal: result.subtotal || 0,
      date: result.date || '',
      currency: result.currency_code || 'USD',
      lineItems: result.line_items || [],
      rawData: result // Include full response for debugging
    };

    console.log('Extracted Receipt Data:', extractedData);

    return NextResponse.json({
      success: true,
      data: extractedData
    });

  } catch (error: any) {
    console.error('Receipt processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process receipt',
        details: error.message 
      },
      { status: 500 }
    );
  }


 
}
