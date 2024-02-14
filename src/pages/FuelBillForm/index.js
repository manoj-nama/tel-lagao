import { format, parse } from "date-fns";
import random from "lodash.random";
import round from "lodash.round";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import AppLayout from "../../components/AppLayout";

const FuelBillForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const canvasRef = useRef();
  const font = 'Droid Sans Mono';
  const fonts = [
    { id: 1, name: 'Fira Code' },
    { id: 2, name: 'Merchant Copy' },
    { id: 3, name: 'Droid Sans Mono' },
    { id: 4, name: 'Consolas' },
  ];
  const brands = [
    { id: 1, name: 'HP', url: '/assets/images/fuel-hp.jpg' },
    { id: 2, name: 'BP', url: '/assets/images/fuel-bp.jpg' }
  ];
  const fields = [
    { x: 32, y: 342, templ: ({ pumpName }) => `${pumpName}` },
    { x: 32, y: 372, templ: ({ city }) => `${city}` },
    { x: 32, y: 402, templ: ({ mobileNo }) => `MOB.976${mobileNo}` },
    { x: 32, y: 480, templ: ({ billNo }) => `Bill No  :${billNo}-ORGNL` },
    { x: 32, y: 510, templ: ({ txnId }) => `Trns.ID  :0000000000${txnId}` },
    { x: 32, y: 540, templ: () => `Atnd.ID  :` },
    { x: 32, y: 570, templ: () => `Vehi.No  :NotEntered` },
    { x: 32, y: 600, templ: ({ date }) => `Date     :${date}` },
    { x: 32, y: 630, templ: ({ time }) => `Time     :${time}` },
    { x: 32, y: 660, templ: ({ pumpNo }) => `FP. ID   :${pumpNo}` },
    { x: 32, y: 690, templ: ({ nozzle }) => `NozzleNo :${nozzle}` },
    { x: 32, y: 720, templ: () => `Fuel     :PETROL` },
    { x: 32, y: 750, templ: () => `Density  :7479kg/m3` },
    { x: 32, y: 780, templ: ({ preset }) => `Preset   :Rs. ${preset}` },
    { x: 32, y: 810, templ: ({ rate }) => `Rate     :Rs. ${rate}` },
    { x: 32, y: 840, templ: ({ price }) => `Sale     :Rs. ${price}` },
    { x: 32, y: 870, templ: ({ volume }) => `Volume   :${volume}L` },
    { x: 90, y: 910, templ: () => `THANKS FOR FUELING` },
  ];

  const initCanvas = (options, callback) => {
    const context = canvasRef.current.getContext('2d');

    // reset
    context.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);

    // image draw
    const image = new Image();
    image.src = options.image;


    image.onload = () => {
      context.drawImage(image, 0, 0, canvasRef.current?.width, canvasRef.current?.height);
      callback && callback();
    };
  };

  const writeText = (text, x, y, option = {}) => {
    const context = canvasRef.current.getContext('2d');

    context.beginPath();
    option.font = option.font || {
      size: 24,
      weight: "100",
      family: font
    };
    if (option.font) {
      let font = '';
      if (option.font.weight)
        font = font + option.font.weight + ' ';

      if (option.font.size)
        font = font + option.font.size + 'px ';

      if (option.font.family)
        font = font + option.font.family;

      context.font = font;
    }

    if (option.textBaseline) {
      context.textBaseline = option.textBaseline || "top";
    };
    if (option.fillStyle) {
      context.fillStyle = option.fillStyle || "#3d3c3a";
    };
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      context.fillText(line, x, y + (i * (option.font.size + 15)));
    });

    context.stroke();
  };

  const downloadBill = () => {
    const image = canvasRef.current.toDataURL("image/png");

    const link = document.createElement('a');
    link.download = "bill.png";
    link.href = image;
    link.click();
  };

  const onDownload = () => {
    downloadBill();
  }

  const onSubmit = (data) => {
    initCanvas({ image: data.brand }, () => {
      const volume = round(parseFloat(data?.price) / parseFloat(data?.rate), 2).toFixed(2);
      const price = round(parseFloat(data?.price), 2).toFixed(2);
      const rate = round(parseFloat(data?.rate), 2).toFixed(2);
      const date = parse(data?.date, "yyyy-MM-dd'T'HH:mm", new Date());
      const time = format(date, "HH:mm:ss");
      const txnId = random(100000, 999999);
      const billNo = random(100000, 999999);
      const mobileNo = random(1000000, 9999999);
      const pumpNo = random(1, 6);
      const nozzle = random(1, 4);
      const fieldsData = {
        price,
        rate,
        date: format(date, "dd/MM/yy"),
        time,
        txnId,
        billNo,
        mobileNo,
        volume,
        preset: '100',
        pumpName: data?.pumpName?.toUpperCase(),
        city: data?.city?.toUpperCase(),
        pumpNo,
        nozzle,
      }

      fields.forEach(f => {
        writeText(f.templ(fieldsData), f.x, f.y, {
          font: {
            size: Number(data.fontSize),
            weight: "100",
            family: data.fontName
          }
        });
      });
    });
  }

  return (
    <AppLayout>
      <section style={{ display: 'flex' }}>
        <div className="container py-4" style={{ maxWidth: '540px', margin: 0 }}>
          <h4>Fuel Bill</h4>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
              <div className="col-6">
                <label htmlFor="fontName">Font Name</label>
                <select
                  placeholder="Font"
                  className="form-control"
                  id="fontName"
                  {...register("fontName", { required: true })}
                >
                  {
                    fonts.map((f) => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="col-6">
                <label htmlFor="fontSize">Font Size</label>
                <input
                  placeholder="Font Size"
                  className="form-control"
                  id="fontSize"
                  type="number"
                  step="1"
                  min="20"
                  defaultValue={24}
                  {...register("fontSize", { required: true })}
                />
              </div>
              <div className="col-12">
                <select
                  placeholder="Font"
                  className="form-control"
                  id="brand"
                  {...register("brand", { required: true })}
                >
                  {
                    brands.map((f) => (
                      <option key={f.id} value={f.url}>{f.name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="col-12">
                <input
                  placeholder="Pump Name"
                  className="form-control"
                  type="text"
                  {...register("pumpName", { required: true })}
                />
                {errors.pumpName && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12">
                <input
                  placeholder="City"
                  className="form-control"
                  type="text"
                  {...register("city", { required: true })}
                />
                {errors.city && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12">
                <input
                  placeholder="Date"
                  className="form-control"
                  type="datetime-local"
                  {...register("date", { required: true })}
                />
                {errors.date && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12">
                <input
                  placeholder="Rate"
                  className="form-control"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("rate", { required: true })}
                />
                {errors.rate && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12">
                <input
                  placeholder="Total Price"
                  className="form-control"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { required: true })}
                />
                {errors.price && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary">
                  Create Bill
                </button>
                <button onClick={onDownload} type="button" className="btn btn-primary">
                  Download Bill
                </button>
              </div>
            </div>
          </form>
        </div>
        <h1 style={{ fontFamily: font, opacity: "0" }}>Hiii</h1>
        <canvas ref={canvasRef} height={1035} width={454} />
      </section>
    </AppLayout>
  );
};

export default FuelBillForm;
