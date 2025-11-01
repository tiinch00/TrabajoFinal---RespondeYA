import soap from 'soap';

const wsdlUrl =
  'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL';

const getSoap = async (req, res) => {
  try {
    soap.createClient(wsdlUrl, (err, client) => {
      if (err) return res.status(500).json({ error: err.message });

      client.ListOfCountryNamesByName({}, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // guardo result en lista, para luego mapear
        const lista = result.ListOfCountryNamesByNameResult.tCountryCodeAndName;

        // formateo JSON simple
        const paises = lista.map((p) => ({
          codigo: p.sISOCode,
          nombre: p.sName,
        }));

        res.json(paises); //wrapper
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default getSoap;
