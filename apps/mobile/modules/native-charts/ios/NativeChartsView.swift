import ExpoModulesCore
import DGCharts

struct Point: Record {
    @Field
    var x: Double = 0
    
    @Field
    var y: Double = 0
}

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class NativeChartsView: ExpoView {
    let chartView = LineChartView()
    
    required init(appContext: AppContext? = nil){
        super.init(appContext: appContext)
        clipsToBounds = true
        addSubview(chartView)
        
        chartView.legend.enabled = false
        
        chartView.leftAxis.enabled = false
        chartView.rightAxis.enabled = true
        
        chartView.rightAxis.labelFont = .systemFont(ofSize: 14, weight: .medium)
        chartView.rightAxis.labelTextColor = .label
        chartView.rightAxis.xOffset = 10
        chartView.rightAxis.axisMinimum = 0
        
        chartView.xAxis.labelPosition = .bottom
        chartView.xAxis.labelFont = .systemFont(ofSize: 14, weight: .medium)
        chartView.xAxis.yOffset = 10
        chartView.xAxis.granularity = 24 * 60 * 60 * 30
        
        chartView.dragXEnabled = true
        chartView.dragYEnabled = false
        chartView.doubleTapToZoomEnabled = false
        chartView.pinchZoomEnabled = false
        
        chartView.xAxis.labelTextColor = .label
    }
    
    override func layoutSubviews() {
        chartView.frame = bounds
    }
    
    func setChartData(data: [Point]){
        let entries = data.map { point in
            ChartDataEntry(
                x: point.x,
                y: point.y
            )
        }

        print("Entries:", entries)
        
        let maxWeight = entries.map { $0.y }.max() ?? 0
        let yAxisMax = ceil((maxWeight + 20) / 50) * 50
        chartView.rightAxis.axisMaximum = yAxisMax
        
        let latestDate = entries.map { $0.x }.max() ?? Date().timeIntervalSince1970
        let earliestDate = entries.map { $0.x }.min() ?? latestDate
        let threeMonthsInSeconds: Double = 90 * 24 * 60 * 60
        
        let now = Date().timeIntervalSince1970
        let threeMonthsAgo = now - threeMonthsInSeconds
        
        chartView.xAxis.axisMaximum = now
        chartView.xAxis.axisMinimum = min(earliestDate, threeMonthsAgo)
        
        
        print(threeMonthsAgo, Date(timeIntervalSince1970: threeMonthsAgo))
        
        let set = LineChartDataSet(entries: entries)
        // DGCharts plots against the left axis by default, but the range is on
        // the right axis, which is the one that shows.
        set.axisDependency = .right
        
        set.colors = [NSUIColor.systemBlue]
        set.circleColors = [NSUIColor.systemBlue]
        set.circleRadius = 5
        set.lineWidth = 2.5
        set.drawValuesEnabled = false
        
        let chartData = LineChartData(dataSet: set)
        chartView.data = chartData
        
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM dd"
        chartView.xAxis.valueFormatter = DefaultAxisValueFormatter { value, _ in
            return formatter.string(from: Date(timeIntervalSince1970: value))
        }
    }
}
