const xlsx = require("node-xlsx");

const ExportData = async (data, res, fileName = "export.xlsx") => {
  if (!data || data.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Aucune donnée à exporter",
    });
  }

  try {
    // Nombre de colonnes basé sur la première ligne
    const cols = data[0].map((_, index) => {
      let maxLength = 10;

      data.forEach((row) => {
        const value = row[index];

        if (value !== null && value !== undefined) {
          maxLength = Math.max(maxLength, String(value).length);
        }
      });

      return { wch: maxLength + 2 };
    });

    const buffer = xlsx.build([
      {
        name: "Données",
        data,
        options: {
          "!cols": cols,
        },
      },
    ]);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'export Excel",
    });
  }
};

module.exports = ExportData;