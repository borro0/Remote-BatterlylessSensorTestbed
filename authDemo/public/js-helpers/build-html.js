// this functions builds the testrun table
function buildTableRows(array)
{
  let markup = '<tbody>';
  for (let i = array.length - 1; i >=0 ; i--) 
  {
    let row = array[i];
    let serial = "<td></td>";
    let trace = "<td></td>";
    let firmware = "<td></td>";
    let status = "<td></td>";
    if (row.serial)
    {
      serial = `<td><a href="/download/testruns/serial/${i}">
        ${row.serial.filename}.${row.serial.filetype}
      </a></td>`;
    }
    if (row.trace)
    {
      trace = `<td><a href="/download/testruns/trace/${i}">
        ${row.trace.filename}.${row.trace.filetype}
      </a></td>`;
    }
    if (row.firmware)
    {
      firmware = `<td><a href="/download/firmwares/firmware/${i}">
        ${row.firmware.filename}.${row.firmware.filetype}
      </a></td>`;
    }
    if (row.status)
    {
      status = `<td>${row.status}</td>`;
    }
    markup += `
    <tr> 
      <td>${row._id}</td>         
      <td>${row.date}</td>
      ${firmware}
      ${serial}
      ${trace}
      ${status}
    </tr> 
    `;
  };
  markup += "</tbody>";
  return markup;
}

function buildFirmwareOptions(firmwares)
{
  let markup = '<option selected>Choose a firmware</option>';
  for (let i = firmwares.length - 1; i >= 0; i--) 
  {
    firmware = firmwares[i];
    console.log(firmware)
    markup += `<option value="${firmware._id}">${firmware.firmware.filename}</option>`;
  };
  return markup;
}