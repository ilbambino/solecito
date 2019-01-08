const canvasSketch = require("canvas-sketch");
const SunCalc = require("suncalc");

const settings = {
  dimensions: [2048, 2048]
};

const sketch = () => {
  const getSunAltitudes = (day, lat, long) => {
    const points = [];

    day.setHours(0, 0, 0, 0);
    for (let hour = 0; hour < 24; hour++) {
      day.setHours(hour);
      let position = SunCalc.getPosition(day, lat, long);
      points.push({
        hour: hour,
        altitude: position.altitude
      });
    }
    // add first as last
    points.push({ hour: 25, altitude: points[0].altitude });
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

  return ({ context, width, height }) => {
    // p5.background(0);
    // p5.fill(255);
    // p5.noStroke();
    context.save();
    context.translate(width / 10, height / 12);
    for (let month = 0; month < 12; month++) {
      const day = new Date();
      day.setMonth(month);

      const points = convertToCoordinates(
        getSunAltitudes(day, 40.41, 3.7),
        width,
        height
      ); //madrid

      context.strokeStyle = "black";
      context.lineWidth = 5;

      drawCurve(context, points); // add cardinal spline to path
      context.stroke();
      context.translate(width / -29, height / 12);
    }
    context.restore();

    context.save();
    context.translate(width / 10, height / 12);
    for (let month = 0; month < 12; month++) {
      const day = new Date();
      day.setMonth(month);

      const points = convertToCoordinates(
        getSunAltitudes(day, 60.17, 24),
        width,
        height
      ); //madrid

      context.strokeStyle = "black";
      context.lineWidth = 1;

      drawCurve(context, points); // add cardinal spline to path
      context.stroke();
      context.translate(width / -29, height / 12);
    }
    context.restore();
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
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.quadraticCurveTo(
    points[i].x,
    points[i].y,
    points[i + 1].x,
    points[i + 1].y
  );
}
canvasSketch(sketch, settings);
