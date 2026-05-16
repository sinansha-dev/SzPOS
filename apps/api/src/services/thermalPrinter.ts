import { ThermalPrinter, PrinterTypes, CharacterSet } from "node-thermal-printer";

let printer: ThermalPrinter | null = null;

// Initialize thermal printer connection
export async function initializePrinter() {
  try {
    const printerConfig: any = {
      type: PrinterTypes.STAR, // Support STAR, EPSON, TANCA printers
      interface: process.env.PRINTER_INTERFACE || "network", // usb, network, or serial
      characterSet: CharacterSet.USA, // Common character set
      lineCharacter: "="
    };

    // Add network-specific config
    if (printerConfig.interface === "network") {
      printerConfig.host = process.env.PRINTER_IP || "192.168.1.50";
      printerConfig.port = parseInt(process.env.PRINTER_PORT || "9100");
    }

    printer = new ThermalPrinter(printerConfig);

    // Test connection
    const isConnected = await printer.isPrinterConnected();
    if (isConnected) {
      console.log("✅ Thermal printer connected successfully");
    } else {
      console.warn("⚠️  Thermal printer not detected, will queue print jobs");
      printer = null;
    }
  } catch (error) {
    console.warn("⚠️  Thermal printer initialization warning:", error instanceof Error ? error.message : error);
    printer = null;
  }
}

// Print receipt for a sale
export async function printReceipt(saleData: any) {
  if (!printer) {
    console.log("📋 Printer not available, queuing receipt");
    return { status: "queued", message: "Printer not connected" };
  }

  try {
    // Clear buffer
    printer.clear();

    // Header
    printer.alignCenter();
    printer.setTextSize(2, 2);
    printer.println("SZPOS");
    printer.setTextSize(1, 1);
    printer.println("Receipt");
    printer.newLine();

    // Sale info
    printer.alignLeft();
    printer.println(`Receipt #: ${saleData.id}`);
    printer.println(`Date: ${new Date().toLocaleString()}`);
    printer.newLine();

    // Items
    printer.println("Items:");
    printer.println("-".repeat(40));

    if (Array.isArray(saleData.items)) {
      for (const item of saleData.items) {
        printer.println(`Product ID: ${item.id}`);
        printer.println(`Qty: ${item.qty}`);
      }
    }

    printer.println("-".repeat(40));
    printer.newLine();

    // Totals
    printer.alignRight();
    const total = saleData.total || 0;
    const tax = saleData.taxTotal || 0;
    const subtotal = total - tax;

    printer.println(`Subtotal: ${subtotal.toFixed(2)}`);
    printer.println(`Tax: ${tax.toFixed(2)}`);
    printer.setTextSize(2, 2);
    printer.println(`Total: ${total.toFixed(2)}`);
    printer.setTextSize(1, 1);

    printer.newLine();

    // Payment method
    printer.alignCenter();
    const method = saleData.payment?.method || "CASH";
    printer.println(`Payment: ${method}`);

    // Footer
    printer.newLine();
    printer.println("Thank you!");
    printer.newLine();

    // Cut paper
    await printer.cut();

    // Actual print (without dialog)
    await printer.execute();

    console.log(`✅ Receipt printed for sale ${saleData.id}`);
    return { status: "printed", message: "Receipt printed successfully" };
  } catch (error) {
    console.error("❌ Print error:", error instanceof Error ? error.message : error);
    return { status: "error", message: error instanceof Error ? error.message : "Print failed" };
  }
}

// Print test (for testing printer connection)
export async function printTest() {
  if (!printer) {
    return { status: "error", message: "Printer not connected" };
  }

  try {
    printer.clear();
    printer.alignCenter();
    printer.setTextSize(2, 2);
    printer.println("PRINTER TEST");
    printer.setTextSize(1, 1);
    printer.newLine();
    printer.println("Printer is working!");
    printer.newLine();
    printer.println(new Date().toLocaleString());
    await printer.cut();
    await printer.execute();
    return { status: "success", message: "Test print sent" };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Test print failed" };
  }
}
