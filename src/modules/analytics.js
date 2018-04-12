var KeenTracking = require('keen-tracking');

// Configure a client instance
var client = new KeenTracking({
	projectId: '5acfb0cfc9e77c0001a033c8',
	writeKey: '4867B74602ACC0560E8CA812456EB1EB57955CFBE41751DA58C3135152249BE21E4714F522048B3ED1153DE5063CB51B1410357E4433C02A6B78EEDCE5731034D838DB5EDADF05CF7CA51E4832720355219006AA86AB00BEA818F1392B273791'
});

export async function recordEvent(name,data) {
	return new Promise((resolve, reject) => {
		client.recordEvent(name, data, (err, res) => {
			if (err) {
				reject(err)
			} else {
				resolve()
			}
		});
	})
}