const canvasSketch = require("canvas-sketch");
const SunCalc = require("suncalc");

const background = "hsl(0, 0%, 98%)";
const settings = {
  dimensions: [2048, 2048]
};

Date.prototype.addDays = function(days) {
  this.setDate(this.getDate() + parseInt(days));
  return this;
};

const sketch = () => {
  const getSunHours = (stepDays, lat, long) => {
    const hours = [];

    let date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setMonth(0);
    date.setDate(21);

    for (let day = 0; day < 366; day += stepDays) {
      let times = SunCalc.getTimes(date, lat, long);
      const sunrise = times.sunrise;
      const sunset = times.sunset;

      let millSecsSunc = sunset - sunrise;
      if (isNaN(millSecsSunc)) {
        millSecsSunc = 0;
      }
      hours.push(millSecsSunc / (1000 * 60 * 60));
      date.addDays(stepDays);
    }
    console.log(date, lat, long, hours);
    return hours;
  };

  const hoursToCoords = (points, width, height) => {
    const coords = [];

    let counter = 0;
    const step = (width / points.length) * 0.8;
    return points.map(item => {
      counter = counter + step;
      return { x: counter, y: item * 0.012 * height };
    });

    const getSunAltitudes = (day, lat, long) => {
      const points = [];

      day.setHours(0, 0, 0, 0);
      for (let hour = 0; hour < 24; hour++) {
        day.setHours(hour);
        let position = SunCalc.getPosition(day, lat, long);
        points.push({
          hour: hour,
          altitude: position.altitude,
          azimuth: position.azimuth
        });
      }
      // add first as last
      points.push({
        hour: 25,
        altitude: points[0].altitude,
        azimuth: points[0].azimuth
      });
      // console.log(points);
      return points.slice(1, points.length); //take first out
    };

    const convertToCoordinates = (points, width, height) => {
      const coords = [];

      return points.map(item => {
        return {
          x: (item.hour / 24) * width,
          y: item.altitude * 0.2 * height * -1
        };
      });
    };
  };

  return ({ context, width, height }) => {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.translate(200, 1650);
    for (let lat = -60; lat < 70; lat = lat + 10) {
      context.save();
      context.translate(0, Math.abs(lat) * -28);
      const hours = hoursToCoords(getSunHours(10, lat, 3.7), width, height);
      console.log(hours);
      context.strokeStyle = "black";
      context.lineWidth = 3;

      drawCurve(context, hours); // add cardinal spline to path

      // context.fillStyle = "black";
      // context.font = "50px serif";
      // context.fillText("" + lat, -50, 28  0);

      context.stroke();
      context.restore();
    }

    // for (let month = 0; month < 12; month = month + 1.5) {
    //   const day = new Date();
    //   day.setMonth(month);

    //   const points = convertToCoordinates(
    //     getSunAltitudes(day, 40.41, 3.7),
    //     width,
    //     height
    //   ); //madrid

    //   context.strokeStyle = "black";
    //   context.lineWidth = 3;

    //   drawCurve(context, points); // add cardinal spline to path

    //   const maxVal = (max, currentValue) =>
    //     max > currentValue.y ? max : currentValue.y;

    //   const minVal = (min, currentValue) =>
    //     min < currentValue.y ? min : currentValue.y;

    //   const max = points.reduce(maxVal);
    //   const min = points.reduce(minVal);

    //   // context.font = "50px serif";
    //   // context.fillText("" + month, 500, 0);
    //   context.stroke();

    //   // context.globalCompositeOperation = "source-over";

    //   let gradient = context.createLinearGradient(0, min, 0, 0);

    //   context.fillStyle = gradient;
    //   // Add three color stops
    //   gradient.addColorStop(0, `hsl(${(month % 9) * 15 + 210},50%,50%)`);
    //   gradient.addColorStop(1, background);

    //   context.fill();

    //   const points2 = convertToCoordinates(
    //     getSunAltitudes(day, 60.17, 24),
    //     width,
    //     height
    //   ); //helsinki

    //   context.strokeStyle = "black";
    //   context.lineWidth = 1;

    //   // drawCurve(context, points2); // add cardinal spline to path
    //   // context.stroke();
    //   context.translate(width / -19, height / 9);
    // }
    // context.restore();

    // context.save();
    // context.translate(width / 10, height / 12);
    // for (let month = 0; month < 12; month++) {
    //   const day = new Date();
    //   day.setMonth(month);

    //   const points = convertToCoordinates(
    //     getSunAltitudes(day, 60.17, 24),
    //     width,
    //     height
    //   ); //madrid

    //   context.strokeStyle = "black";
    //   context.lineWidth = 1;

    //   drawCurve(context, points); // add cardinal spline to path
    //   context.stroke();
    //   context.translate(width / -29, height / 12);
    // }
    // context.restore();
  };
};
function drawCurve(ctx, points) {
  ctx.beginPath();
  if (points == undefined || points.length == 0) {
    return true;
  }
  if (points.length == 1) {
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[0].x, points[0].y);
    return true;
  }
  if (points.length == 2) {
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    return true;
  }
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < points.length - 2; i++) {
    var xc = (points[i].x + points[i + 1].x) / 2;
    var yc = (points[i].y + points[i + 1].y) / 2;
    ctx.lineTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.quadraticCurveTo(
    points[i].x,
    points[i].y,
    points[i + 1].x,
    points[i + 1].y
  );
}
canvasSketch(sketch, settings);
