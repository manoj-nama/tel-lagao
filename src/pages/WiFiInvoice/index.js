import { format, parse } from "date-fns";
import random from "lodash.random";
import round from "lodash.round";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const logo = `data:image/png;base64,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`;

const WiFiInvoice = () => {
  const timeoutRef = useRef(null);
  let [searchParams] = useSearchParams();

  const date = parse(searchParams.get("date"), "yyyy-MM-dd", new Date());
  const price = round(parseFloat(searchParams.get("price")), 2).toFixed(2);
  const tax = round((parseFloat(price) * 18) / 100, 2).toFixed(2);
  const total = round(parseFloat(price) + parseFloat(tax), 2).toFixed(2);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      window.print();
    }, 1000);
  }, []);

  return (
    <>
      <br />
      <br />
      <br />
      <div
        style={{
          maxWidth: "580px",
          margin: "auto",
          border: "1px solid #000",
          padding: "4px",
        }}
      >
        <table cellSpacing={2} width="100%">
          <tbody>
            <tr>
              <td colSpan={2} style={{ width: "100%", backgroundColor: "red", WebkitPrintColorAdjust: 'exact' }}>
                <p
                  style={{
                    color: "white",
                    margin: 0,
                    padding: "5px 1px",
                    fontSize: "11.5pt",
                    fontWeight: 400,
                    backgroundColor: "red",
                  }}
                >
                  Payment Receipt
                </p>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #ababab" }}>
              <td colSpan={2} style={{ width: "100%" }}>
                <img src={logo} width="101" alt="Airtel" />
                <p
                  style={{
                    paddingLeft: "2px",
                    fontSize: "11.5pt",
                    color: "#000",
                    fontWeight: 400,
                    marginBottom: "10px",
                    marginTop: "4px",
                    lineHeight: "1.2",
                  }}
                >
                  Thank you for using My Airtel app. We hope you had an awesome
                  transaction experience.
                </p>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #ababab" }}>
              <td style={{ width: "35%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "left",
                    paddingLeft: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  Payment Date
                </p>
              </td>
              <td style={{ width: "65%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "right",
                    paddingRight: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  {searchParams.get("date")}
                </p>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #ababab" }}>
              <td style={{ width: "35%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "left",
                    paddingLeft: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  Time
                </p>
              </td>
              <td style={{ width: "65%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "right",
                    paddingRight: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  {format(new Date(), "HH:mm:ss a")}
                </p>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #ababab" }}>
              <td style={{ width: "35%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "left",
                    paddingLeft: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  Name
                </p>
              </td>
              <td style={{ width: "65%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "right",
                    paddingRight: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  {searchParams.get("name")}
                </p>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #ababab" }}>
              <td style={{ width: "35%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "left",
                    paddingLeft: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  Account Number
                </p>
              </td>
              <td style={{ width: "65%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "right",
                    paddingRight: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  {random(6000000000, 9999999999)}
                </p>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #ababab" }}>
              <td style={{ width: "35%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "left",
                    paddingLeft: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  Mobile Number
                </p>
              </td>
              <td style={{ width: "65%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "right",
                    paddingRight: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  {searchParams.get("landline")}
                </p>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #ababab" }}>
              <td style={{ width: "35%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "left",
                    paddingLeft: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  Transaction Reference
                </p>
              </td>
              <td style={{ width: "65%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "right",
                    paddingRight: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                    width: "100%",
                  }}
                >
                  {random(100000000000000, 999999999999999)}|
                  {random(10000000, 99999999)}|BTS|{format(date, "dd-MMMyy")}
                  <br />
                  |Online|{random(100000000000000, 999999999999999)}^
                  {random(100000000000000, 999999999999999)}^
                  {random(100000000000000, 999999999999999)}
                  <br />
                  |PayU|{searchParams.get("landline")}|
                  {random(100000000, 999999999)}
                </p>
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #ababab" }}>
              <td style={{ width: "35%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "left",
                    paddingLeft: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  Pay via
                </p>
              </td>
              <td style={{ width: "65%" }}>
                <p
                  style={{
                    color: "#999",
                    textAlign: "right",
                    paddingRight: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                  }}
                >
                  Online RF - PayU Money
                </p>
              </td>
            </tr>
            <tr>
              <td style={{ width: "35%" }}>
                <p
                  style={{
                    color: "#000",
                    textAlign: "left",
                    paddingLeft: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                    fontWeight: "600",
                  }}
                >
                  Amount Paid
                </p>
              </td>
              <td style={{ width: "65%" }}>
                <p
                  style={{
                    color: "#000",
                    textAlign: "right",
                    paddingRight: "2px",
                    fontSize: "10.5pt",
                    margin: "5px 0",
                    fontWeight: "600",
                  }}
                >
                  Rs {total}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default WiFiInvoice;
