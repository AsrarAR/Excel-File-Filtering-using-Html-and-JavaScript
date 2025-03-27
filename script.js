document.getElementById('processBtn').addEventListener('click', async function () {
    let files = document.getElementById('fileInput').files;
    let maxDuration = document.getElementById('durationInput').value.trim();

    if (files.length === 0 || !maxDuration) {
        alert("Please upload files and enter a max duration.");
        return;
    }

    let maxSeconds = convertToSeconds(maxDuration);
    if (isNaN(maxSeconds)) {
        alert("Invalid duration format. Use HH HOURS : MM MINUTES : SS SECONDS.");
        return;
    }

    let filteredData = [];

    for (let file of files) {
        let data = await readExcel(file);
        let filtered = data.filter(row => convertToSeconds(row["TOTAL DURATION"]) <= maxSeconds);
        filteredData.push(...filtered);
    }

    if (filteredData.length > 0) {
        exportToExcel(filteredData);
    } else {
        alert("No data matched the filter criteria.");
    }
});

// Reads Excel file and converts to JSON
function readExcel(file) {
    return new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = (e) => {
            let workbook = XLSX.read(e.target.result, { type: "binary" });
            let sheet = workbook.Sheets[workbook.SheetNames[0]];
            let data = XLSX.utils.sheet_to_json(sheet);
            resolve(data);
        };
        reader.readAsBinaryString(file);
    });
}

// Converts "HH HOURS : MM MINUTES : SS SECONDS" to total seconds
function convertToSeconds(timeStr) {
    let match = timeStr.match(/(\d+)\s*HOURS\s*:\s*(\d+)\s*MINUTES\s*:\s*(\d+)\s*SECONDS/);
    if (!match) return NaN;

    let [_, hours, minutes, seconds] = match.map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

// Exports filtered data to Excel
function exportToExcel(data) {
    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FilteredData");
    XLSX.writeFile(wb, "Filtered_Data.xlsx");
}
