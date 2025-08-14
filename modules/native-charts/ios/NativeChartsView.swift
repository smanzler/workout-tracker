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
        chartView.rightAxis.enabled = false
        
        chartView.leftAxis.labelFont = .systemFont(ofSize: 14, weight: .medium)
        chartView.leftAxis.labelTextColor = .label
        chartView.leftAxis.spaceTop = 15
        chartView.leftAxis.spaceBottom = 15
        chartView.leftAxis.xOffset = 10
        chartView.leftAxis.axisMinimum = 0
        chartView.leftAxis.labelCount = 6
        chartView.leftAxis.forceLabelsEnabled = false
        
        chartView.xAxis.labelPosition = .bottom
        chartView.xAxis.labelFont = .systemFont(ofSize: 14, weight: .medium)
        chartView.xAxis.yOffset = 10
        chartView.xAxis.granularity = 24 * 60 * 60 * 30
        
        chartView.dragEnabled = true
        chartView.dragXEnabled = true
        chartView.dragYEnabled = false
        chartView.setScaleEnabled(false)
        chartView.pinchZoomEnabled = false
        chartView.doubleTapToZoomEnabled = false
        
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
        chartView.leftAxis.axisMaximum = yAxisMax
        
        let latestDate = entries.map { $0.x }.max() ?? Date().timeIntervalSince1970
        let threeMonthsInSeconds: Double = 90 * 24 * 60 * 60
        
        chartView.xAxis.axisMaximum = latestDate
        chartView.xAxis.axisMinimum = entries.map { $0.x }.min() ?? 0
        
        let set = LineChartDataSet(entries: entries)
        
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
