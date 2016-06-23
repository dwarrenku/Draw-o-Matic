var rightMotorSlider, leftMotorSlider, runTime, rightMotorRadius, leftMotorRadius;
var xy;
var max, min;
var rightSelector, leftSelector;

function graph()
{
    //array for the coordinate objects
    xy = [];
    //variables from page sliders
    var leftrpm = leftMotorSlider;
    var rightrpm = rightMotorSlider;
//Define parameters---------------------------
    var pi = Math.PI;
    //sample rate in Hz
    var fs = 20;
    //Duration in sec
    var T = runTime;
    //number of samples
    var num_samples = T * fs;
    //speed of motors
    var rate_left, rate_right;
    switch (rightSelector)
    {
        case "linear":
            rate_right = 2 * pi / rightrpm;
            break;
        case "sine":
            rate_right = Math.sin(((2 * pi) / rightrpm));
            break;
        case "cosine":
            rate_right = Math.cos(((2 * pi) / rightrpm));
            break;
        case "tangent":
            rate_right = Math.tan(((2 * pi) / rightrpm));
            break;
        case "inverse tangent":
            rate_right = Math.atan(((2 * pi) / rightrpm));
            break;
    }
    switch (leftSelector)
    {
        case "linear":
            rate_left = 2 * pi / leftrpm;
            break;
        case "sine":
            rate_left = Math.sin(((2 * pi) / leftrpm));
            break;
        case "cosine":
            rate_left = Math.cos(((2 * pi) / leftrpm));
            break;
        case "tangent":
            rate_left = Math.tan(((2 * pi) / leftrpm));
            break;
        case "inverse tangent":
            rate_left = Math.atan(((2 * pi) / leftrpm));
            break;
    }
    //initial angles
    var angle_left_0 = 0;
    var angle_right_0 = 0;

//Define the Geometry-------------------------
    //location of gear centers
    var origin_left = [0, 0];
    var origin_right = [35, 0];

    //radius of gears
    var radius_left = leftMotorRadius;
    var radius_right = rightMotorRadius;

    //segment lengths
    var length_ce = 30, length_eg = 10;
    var length_de = 30, length_ef = 10;
    var length_fh = 10, length_hi = 3;
    var length_gh = 10;
    var length_cg = length_ce + length_eg;
    var length_fi = length_fh + length_hi;

    var angle_left = angle_left_0, angle_right = angle_right_0;

    //initialize variables for the loop
    var length_cd, length_fg,
            Cx, Cy, Dx, Dy, Ex, Ey, Fx, Fy, Gx, Gy, Hx, Hy, Ix, Iy,
            angle_xcd, angle_dce, angle_xce, angle_xef,
            angle_ced, angle_feg, angle_xfg, angle_gfh, angle_xfi;
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
//simulation calculations---------------------
    for (var i = 0; i < num_samples; i++)
    {
        //angular position of gear
        angle_left = rate_left * i / fs;
        angle_right = rate_right * i / fs;

        Cx = origin_left[0] + radius_left * Math.cos(angle_left);
        Cy = origin_left[1] + radius_left * Math.sin(angle_left);

        Dx = origin_right[0] + radius_right * Math.cos(angle_right);
        Dy = origin_right[1] + radius_right * Math.sin(angle_right);

        length_cd = Math.sqrt(Math.pow((Dx - Cx), 2) + Math.pow((Dy - Cy), 2));

        angle_xcd = Math.atan2(Dy - Cy, Dx - Cx);

        angle_dce = Math.acos(-(Math.pow(length_de, 2) - Math.pow(length_ce, 2) - Math.pow(length_cd, 2)) /
                (2 * length_ce * length_cd));
        angle_xce = angle_xcd + angle_dce;

        Ex = length_ce * Math.cos(angle_xce) + Cx;
        Ey = length_ce * Math.sin(angle_xce) + Cy;

        Gx = length_cg * Math.cos(angle_xce) + Cx;
        Gy = length_cg * Math.sin(angle_xce) + Cy;

        angle_ced = Math.acos(-(Math.pow(length_cd, 2) - Math.pow(length_ce, 2) - Math.pow(length_de, 2)) /
                (2 * length_ce * length_de));
        angle_feg = angle_ced;

        angle_xef = angle_xce + angle_feg;

        Fx = length_ef * Math.cos(angle_xef) + Ex;
        Fy = length_ef * Math.sin(angle_xef) + Ey;

        length_fg = Math.sqrt(Math.pow((Gx - Fx), 2) + Math.pow((Gy - Fy), 2));

        angle_xfg = Math.atan2(Dy - Cy, Dx - Cx);

        angle_gfh = Math.acos(-(Math.pow(length_gh, 2) - Math.pow(length_fh, 2) - Math.pow(length_fg, 2)) /
                (2 * length_fh * length_fg));
        angle_xfi = angle_xfg + angle_gfh;

        Hx = length_fh * Math.cos(angle_xfi) + Fx;
        Hy = length_fh * Math.sin(angle_xfi) + Fy;

        Ix = length_fi * Math.cos(angle_xfi) + Fx;
        Iy = length_fi * Math.sin(angle_xfi) + Fy;

        //fill the array of coordinate objects
        xy.push({x: Ix, y: Iy});
    }
    min = 0;
    max = 0;
    var coord, smallest, biggest;
    for (coord in xy) {
        smallest = Math.min(xy[coord].x, xy[coord].y);
        biggest = Math.max(xy[coord].x, xy[coord].y);

        if (smallest < min)
            min = smallest;
        if (biggest > max)
            max = biggest;
    }

    //convert all values to the canvas space
    var xy = xy.map(function (e) {
        e.x = remap(e.x);
        e.y = remap(e.y);
        return e;
    });

    //start drawing
    ctx.lineWidth = .25;
    ctx.beginPath();
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = 'rgb(0, 0, 0)';

//create quadratic curves for smooth lines
    for (var j = 1; j < xy.length - 2; j++) {
        var e = (xy[j].x + xy[j + 1].x) / 2;
        var f = (xy[j].y + xy[j + 1].y) / 2;

        ctx.quadraticCurveTo(xy[j].x, xy[j].y - 500, e, f - 500);
    }
    ctx.stroke();
    ctx.closePath();
}

//remaps the values to fit the canvas
function remap(value) {
    return 0 + (1000 - 0) * (value - min) / (max - min);
}