import Style from "./style.js"

export default class Scales {
	static ChoroplethScaleFn(features) {
        return
	}

    static ProportionScaleFn(features) {
        let featureArray = []
        features.forEach(element => {
            featureArray.push(element.getProperties().id)
        });

        let max = (d3.max(featureArray));
        let min = d3.min(featureArray);

        let a = d3.scaleLinear()
            .domain([min, max])
            .range([0, 0.1])

        let c = d3.scaleLinear()
        .domain([
            0,
            max * 0.25,
            max * 0.5,
            max * 0.75,
            max,
        ])
        .range([0.02, 0.04, 0.06, 0.08, 0.1]);
        

        let z = d3.scaleQuantize()
        .domain(d3.extent(featureArray))
        .range([0.05, 0.1, 0.15, 0.2, 0.25])

    
        return z;

    }

    static IdentifiedScaleFn(features) {
        return
	}
}