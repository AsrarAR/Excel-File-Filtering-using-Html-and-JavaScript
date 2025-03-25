document.getElementById('processBtn').addEventListener('click', async function () {
            let files = document.getElementById('fileInput').files;
            let maxDuration = document.getElementById('durationInput').value.trim();
            
            if (files.length === 0 || !maxDuration) {
                alert("Please upload files and enter a max duration.");
                return;
            }

            let maxSeconds = convertToSeconds(maxDuration);
            if (isNaN(maxSeconds)) {
                alert("Invalid duration format. Use HH Hours: MM Minutes: SS Seconds.");
                return;
            }

            let filteredData = [];

            for (let file of files) {
                let data = await readExcel(file);
                let filtered = data.filter(row => convertToSeconds(row["Total-Duration"]) <= maxSeconds);
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

        // Converts "HH Hours: MM Minutes: SS Seconds" to total seconds
        function convertToSeconds(timeStr) {
            let parts = timeStr.match(/(\d+)\s*Hours:\s*(\d+)\s*Minutes:\s*(\d+)\s*Seconds/);
            if (!parts) return NaN;
            return parseInt(parts[1]) * 3600 + parseInt(parts[2]) * 60 + parseInt(parts[3]);
        }

        // Exports filtered data to Excel
        function exportToExcel(data) {
            let ws = XLSX.utils.json_to_sheet(data);
            let wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "FilteredData");
            XLSX.writeFile(wb, "Filtered_Data.xlsx");
        }