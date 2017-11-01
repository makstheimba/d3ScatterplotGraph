const fetchCyclistData = () => fetch(
	'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
)
	.then(res => res.json())
	.catch(alert);

async function startApp() {
	const margin = {top: 10, left: 30, bottom: 20, right: 10};
	const viewBox = {width: 1000, height: 600};
	const width = viewBox.width - margin.left - margin.right;
	const height = viewBox.height - margin.top - margin.bottom;
	const chart = d3.select('.chart')
		.attr('viewBox', `0 0 ${viewBox.width} ${viewBox.height}`)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	const cyclistData = await fetchCyclistData();
}

window.onload = startApp;
