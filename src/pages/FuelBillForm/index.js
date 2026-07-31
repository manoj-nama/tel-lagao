import { format, parse } from "date-fns";
import JSZip from "jszip";
import random from "lodash.random";
import round from "lodash.round";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import AppLayout from "../../components/AppLayout";

const fonts = [
  { id: 1, name: "Fira Code" }, { id: 2, name: "Merchant Copy" },
  { id: 3, name: "Droid Sans Mono" }, { id: 4, name: "Consolas" },
  { id: 5, name: "Sis" }, { id: 6, name: "Fake Receipt" },
];

const brands = [
  { id: 1, name: "HP", pumpName: "HPCL*ETA-II", url: "/assets/images/fuel-hp.png" },
  { id: 2, name: "BP", pumpName: "BPCL*ETA-II", url: "/assets/images/fuel-bp.jpg" },
  { id: 3, name: "HP2", pumpName: "HPCL*ETA-II", url: "/assets/images/bg3.jpg" },
  { id: 4, name: "IOCL", pumpName: "IOCL*ETA-II", url: "/assets/images/iocl.png" },
];

const fields = [
  { x: 32, y: 342, templ: ({ pumpName }) => pumpName },
  { x: 32, y: 372, templ: ({ city }) => city },
  { x: 32, y: 402, templ: ({ mobileNo }) => `MOB.976${mobileNo}` },
  { x: 32, y: 480, templ: ({ billNo }) => `Bill No  :${billNo}-ORGNL` },
  { x: 32, y: 510, templ: ({ txnId }) => `Trns.ID  :000000000${txnId}` },
  { x: 32, y: 540, templ: () => "Atnd.ID  :" },
  { x: 32, y: 570, templ: () => "Vehi.No  :NotEntered" },
  { x: 32, y: 600, templ: ({ date }) => `Date     :${date}` },
  { x: 32, y: 630, templ: ({ time }) => `Time     :${time}` },
  { x: 32, y: 660, templ: ({ pumpNo }) => `FP.ID    :${pumpNo}` },
  { x: 32, y: 690, templ: ({ nozzle }) => `NozzleNo :${nozzle}` },
  { x: 32, y: 720, templ: () => "Fuel     :PETROL" },
  { x: 32, y: 750, templ: () => "Density  :7479kg/m3" },
  { x: 32, y: 780, templ: ({ preset }) => `Preset   :Rs. ${preset}` },
  { x: 32, y: 810, templ: ({ rate }) => `Rate     :Rs. ${rate}` },
  { x: 32, y: 840, templ: ({ price }) => `Sale     :Rs. ${price}` },
  { x: 32, y: 870, templ: ({ volume }) => `Volume   :${volume}L` },
  { x: 90, y: 910, templ: () => "THANKS FOR FUELING" },
  { x: 145, y: 940, templ: () => "VISIT AGAIN" },
];

const blankBill = () => ({ brand: brands[0].url, fontName: "", fontSize: "", pumpName: brands[0].pumpName, city: "Greater Noida", date: "", rate: "", price: "" });

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("Could not load the selected bill template."));
  image.src = src;
});

const canvasToBlob = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create the bill image.")), "image/png");
});

const FuelBillForm = () => {
  const canvasRef = useRef();
  const [selectedRow, setSelectedRow] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState("");
  const { control, getValues, register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { fontName: "Droid Sans Mono", fontSize: 24, bills: [blankBill()] },
  });
  const { fields: billRows, append, remove } = useFieldArray({ control, name: "bills" });

  const writeText = (canvas, text, x, y, settings) => {
    const context = canvas.getContext("2d");
    context.beginPath();
    context.font = `100 ${Number(settings.fontSize)}px ${settings.fontName}`;
    context.fillStyle = "#3d3c3a";
    text.split("\n").forEach((line, index) => context.fillText(line, x, y + (index * (Number(settings.fontSize) + 15))));
    context.stroke();
  };

  const renderBill = async (canvas, bill, settings) => {
    const image = await loadImage(bill.brand);
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const dateTime = parse(bill.date, "yyyy-MM-dd'T'HH:mm", new Date());
    const price = round(parseFloat(bill.price), 2).toFixed(2);
    const rate = round(parseFloat(bill.rate), 2).toFixed(2);
    const fieldsData = {
      price, rate,
      date: format(dateTime, "dd/MM/yy"), time: format(dateTime, "HH:mm:ss"),
      volume: round(parseFloat(price) / parseFloat(rate), 2).toFixed(2),
      txnId: random(100000, 999999), billNo: random(100000, 999999),
      mobileNo: random(1000000, 9999999), pumpNo: random(1, 6), nozzle: random(1, 4),
      preset: "100", pumpName: bill.pumpName.toUpperCase(), city: bill.city.toUpperCase(),
    };
    fields.forEach((field) => writeText(canvas, field.templ(fieldsData), field.x, field.y, {
      ...settings,
      fontName: bill.fontName || settings.fontName,
      fontSize: bill.fontSize || settings.fontSize,
    }));
  };

  const previewBill = async (data) => {
    setProgress("");
    await renderBill(canvasRef.current, data.bills[selectedRow], data);
  };

  const downloadAll = async (data) => {
    setIsExporting(true);
    const zip = new JSZip();
    const monthlyBillCounts = new Map();
    try {
      for (let index = 0; index < data.bills.length; index += 1) {
        setProgress(`Rendering bill ${index + 1} of ${data.bills.length}…`);
        const canvas = document.createElement("canvas");
        canvas.width = 454;
        canvas.height = 1035;
        await renderBill(canvas, data.bills[index], data);
        const month = format(parse(data.bills[index].date, "yyyy-MM-dd'T'HH:mm", new Date()), "MMM").toLowerCase();
        const billCount = (monthlyBillCounts.get(month) || 0) + 1;
        monthlyBillCounts.set(month, billCount);
        zip.file(`${month}-bill-${billCount}.png`, await canvasToBlob(canvas));
      }
      setProgress("Preparing ZIP download…");
      const archive = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      link.href = url;
      link.download = "fuel-bills.zip";
      link.click();
      URL.revokeObjectURL(url);
      setProgress(`Downloaded ${data.bills.length} bills.`);
    } catch (error) {
      setProgress(error.message || "Could not generate the bills.");
    } finally {
      setIsExporting(false);
    }
  };

  const removeRow = (index) => {
    remove(index);
    setSelectedRow((current) => Math.max(0, Math.min(current, billRows.length - 2)));
  };

  const addBill = () => {
    const existingBills = getValues("bills");
    const previousBill = existingBills[existingBills.length - 1];
    append({ ...blankBill(), date: previousBill?.date || "" });
    setSelectedRow(billRows.length);
  };

  return (
    <AppLayout>
      <section style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "24px", padding: "0 24px 24px" }}>
        <div className="py-4" style={{ flex: "1 1 760px", minWidth: 0 }}>
          <h4>Fuel Bills</h4>
          <form>
            <div className="row">
              <div className="col-6"><label htmlFor="fontName">Font Name</label><select className="form-control" id="fontName" {...register("fontName", { required: true })}>{fonts.map((font) => <option key={font.id} value={font.name}>{font.name}</option>)}</select></div>
              <div className="col-6"><label htmlFor="fontSize">Font Size</label><input className="form-control" id="fontSize" type="number" min="20" step="1" {...register("fontSize", { required: true, min: 20 })} /></div>
              <div className="col-12 mt-4">
                <div className="table-responsive">
                  <table className="table table-bordered table-sm mb-0">
                    <thead>
                      <tr><th>#</th><th>Template</th><th>Font</th><th>Size</th><th>Pump name</th><th>City</th><th>Date &amp; time</th><th>Rate</th><th>Total price</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {billRows.map((row, index) => (
                        <tr key={row.id} className={selectedRow === index ? "table-active" : undefined}>
                          <th scope="row" className="align-middle">{index + 1}</th>
                          <td><select aria-label={`Template for bill ${index + 1}`} className="form-control form-control-sm" {...register(`bills.${index}.brand`, { required: true })} onChange={(event) => { const brand = brands.find((item) => item.url === event.target.value); setValue(`bills.${index}.brand`, event.target.value, { shouldDirty: true, shouldValidate: true }); setValue(`bills.${index}.pumpName`, brand?.pumpName || "", { shouldDirty: true, shouldValidate: true }); }}>{brands.map((brand) => <option key={brand.id} value={brand.url}>{brand.name}</option>)}</select></td>
                          <td><select aria-label={`Font for bill ${index + 1}`} className="form-control form-control-sm" {...register(`bills.${index}.fontName`)}><option value="">Use default</option>{fonts.map((font) => <option key={font.id} value={font.name}>{font.name}</option>)}</select></td>
                          <td><input aria-label={`Font size for bill ${index + 1}`} className="form-control form-control-sm" type="number" min="20" step="1" placeholder="Default" {...register(`bills.${index}.fontSize`, { min: 20 })} />{errors.bills?.[index]?.fontSize && <div className="text-danger small">Min. 20</div>}</td>
                          <td><input aria-label={`Pump name for bill ${index + 1}`} className="form-control form-control-sm" {...register(`bills.${index}.pumpName`, { required: true })} />{errors.bills?.[index]?.pumpName && <div className="text-danger small">Required</div>}</td>
                          <td><input aria-label={`City for bill ${index + 1}`} className="form-control form-control-sm" {...register(`bills.${index}.city`, { required: true })} />{errors.bills?.[index]?.city && <div className="text-danger small">Required</div>}</td>
                          <td><input aria-label={`Date for bill ${index + 1}`} className="form-control form-control-sm" type="datetime-local" {...register(`bills.${index}.date`, { required: true })} />{errors.bills?.[index]?.date && <div className="text-danger small">Required</div>}</td>
                          <td><input aria-label={`Rate for bill ${index + 1}`} className="form-control form-control-sm" type="number" step="0.01" min="0.01" {...register(`bills.${index}.rate`, { required: true, min: 0.01 })} />{errors.bills?.[index]?.rate && <div className="text-danger small">Above zero</div>}</td>
                          <td><input aria-label={`Total price for bill ${index + 1}`} className="form-control form-control-sm" type="number" step="0.01" min="0" {...register(`bills.${index}.price`, { required: true, min: 0 })} />{errors.bills?.[index]?.price && <div className="text-danger small">Required</div>}</td>
                          <td className="text-nowrap"><button type="button" className="btn btn-sm btn-outline-secondary mr-1" onClick={() => setSelectedRow(index)}>Select</button>{billRows.length > 1 && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeRow(index)}>Remove</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-12 mt-3"><button type="button" className="btn btn-outline-primary" onClick={addBill}>Add another bill</button></div>
              <div className="col-12 mt-3"><button onClick={handleSubmit(previewBill)} type="button" className="btn btn-primary mr-2">Preview selected bill</button><button onClick={handleSubmit(downloadAll)} type="button" className="btn btn-primary" disabled={isExporting}>{isExporting ? "Generating…" : "Download all bills (.zip)"}</button>{progress && <div className="small mt-2" role="status">{progress}</div>}</div>
            </div>
          </form>
        </div>
        <canvas ref={canvasRef} height={1035} width={454} style={{ flex: "0 0 auto", maxWidth: "100%", height: "auto" }} />
      </section>
    </AppLayout>
  );
};

export default FuelBillForm;
