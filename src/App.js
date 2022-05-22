import { BrowserRouter, Route, Routes } from "react-router-dom";

import AmazonInvoice from "./pages/AmazonInvoice";
import AmazonInvoiceForm from "./pages/AmazonInvoiceForm";
import FuelBillForm from "./pages/FuelBillForm";
import Home from "./pages/Home";
import UdemyCertificate from "./pages/UdemyCertificate";
import UdemyInvoice from "./pages/UdemyInvoice";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/udemy-certificate" element={<UdemyCertificate />} />
        <Route path="/udemy-invoice" element={<UdemyInvoice />} />
        <Route path="/amazon-invoice-form" element={<AmazonInvoiceForm />} />
        <Route path="/amazon-invoice" element={<AmazonInvoice />} />
        <Route path="/fuel-bill-form" element={<FuelBillForm />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
