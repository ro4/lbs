var map = new BMap.Map("menu");                        // 创建Map实例
map.centerAndZoom("重庆", 11);     // 初始化地图,设置中心点坐标和地图级别
var defaultCursor = map.getDefaultCursor();
map.enableScrollWheelZoom(true);   //鼠标滑动轮子可以滚动    
map.addControl(new BMap.NavigationControl());  //添加鱼骨控件
map.addControl(new BMap.MapTypeControl());     //添加地图类型控件
map.addControl(new BMap.ScaleControl());     
map.addControl(new BMap.OverviewMapControl());

var key = 1;    //开关
var points = [];    //数组，放经纬度信息
var layouts = [];   //存放图层数组

function startTool() {   //开关函数
    if (key == 1) {
        map.setDefaultCursor("crosshair"); //设置十字光标
        document.getElementById("startBtn").style.background = "green";
        document.getElementById("startBtn").style.color = "white";
        document.getElementById("startBtn").value = "结束选点";
        key = 0;
    }
    else {
        map.setDefaultCursor(defaultCursor); //设置默认光标
        document.getElementById("startBtn").style.background = "red";
        document.getElementById("startBtn").value = "开启选点";
        layouts.push(points);
        points = [];
        drawOverlay(true, true);
        key = 1;
    }
}

function drawOverlay(polyline, polygon) {  // 画折线和多边形
    map.clearOverlays();
    document.getElementById("info").innerHTML = "";
    if (points.length == 0) return;
    //画点
    map.addOverlay(new BMap.Marker(points[points.length - 1]));
    //画折线
    if (polyline == true) {
        var polyline = new BMap.Polyline(); //折线覆盖物
        polyline.setPath(points);           //设置折线的点数组
        map.addOverlay(polyline);           //将折线添加到地图上
    }
    //画多边形
    if (polygon == true) {
        var polygon = new BMap.Polygon(points);
        map.addOverlay(polygon);            //将多边形添加到地图上
    }
    //显示列表        
    for(var i=0; i<points.length; i++)
        document.getElementById("info").innerHTML += "new BMap.Point(" + points[i].lng + "," + points[i].lat + "),</br>";    //输出数组里的经纬度
}

map.addEventListener("click", function (e) {   //单击地图，形成折线覆盖物
    var lngLat = e.point;
    if (key == 0) {
        points.push(lngLat);  //将新增的点放到数组中
        drawOverlay(true, false);

        // 显示提示信息
        var zoomStr = "放大级别：" + this.getZoom();

        var lngLatStr = "<br />经纬度：" + lngLat.lng + ", " + lngLat.lat;

        var projection = this.getMapType().getProjection();
        var worldCoordinate = projection.lngLatToPoint(lngLat);
        var worldCoordStr = "<br />平面坐标：" + worldCoordinate.x + ", " + worldCoordinate.y;

        var pixelCoordinate = new BMap.Pixel(Math.floor(worldCoordinate.x * Math.pow(2, this.getZoom() - 18)),
                                             Math.floor(worldCoordinate.y * Math.pow(2, this.getZoom() - 18)));
        var pixelCoordStr = "<br />像素坐标：" + pixelCoordinate.x + ", " + pixelCoordinate.y;

        var tileCoordinate = new BMap.Pixel(Math.floor(pixelCoordinate.x / 256),
                                       Math.floor(pixelCoordinate.y / 256));
        var tileCoordStr = "<br />图块坐标：" + tileCoordinate.x + ", " + tileCoordinate.y;

        var viewportCoordinate = map.pointToPixel(lngLat);
        var viewportCoordStr = "<br />可视区域坐标：" + viewportCoordinate.x + ", " + viewportCoordinate.y;

        var overlayCoordinate = map.pointToOverlayPixel(lngLat);
        var overlayCoordStr = "<br />覆盖物坐标：" + overlayCoordinate.x + ", " + overlayCoordinate.y;

        var info = new BMap.InfoWindow('', { width: 260 });
        info.setContent(zoomStr + lngLatStr + worldCoordStr + pixelCoordStr + tileCoordStr +
                        viewportCoordStr + overlayCoordStr);
        // map.openInfoWindow(info, lngLat);
    }
});
