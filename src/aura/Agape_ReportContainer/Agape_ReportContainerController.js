({
    getReport : function(component, event, helper) {
        //hide report and show spinner while we process
        var loadingSpinner = component.find('loading');
        $A.util.removeClass(loadingSpinner, 'slds-hide');
        var reportContainer = component.find('report');
        $A.util.addClass(reportContainer, 'slds-hide');
        var reportError = component.find('report-error');
        $A.util.addClass(reportError, 'slds-hide');

        //get report data from Apex controller using report ID provided
        var action = component.get('c.getReportMetadata');
        action.setParams({ 
            reportId: component.get("v.reportIdAttribute"),
            recordId: component.get("v.recordId"),
            recordIdFilterColumn: component.get("v.recordIdFilterColumn")
        });

        //handle response from Apex controller
        action.setCallback(this, function(response){
            // transform into JSON object
            var returnValue = JSON.parse(response.getReturnValue());
            var groupingLabels = {};
            
            if( returnValue && returnValue.reportExtendedMetadata ){
                // Check if data exists
                for (var dataMap in returnValue.factMap) {
                    var dataExists = returnValue.factMap[dataMap].rows != null;
                    if (dataExists) {
                        break;
                    }
                }

                // If data exists, proceed with building out component variable data
                if (dataExists) {
                    // categorize groupings into levels so we can access them as we go down grouping level
                    var columnInfo = returnValue.reportExtendedMetadata.groupingColumnInfo;
                    var groupingKeys = [];
                    for( var property in columnInfo ){
                        if( columnInfo.hasOwnProperty(property) ){
                            var level = columnInfo[property].groupingLevel;
                            var label = columnInfo[property].label;
                            groupingLabels[level] = label;
                            groupingKeys.push(columnInfo[property].groupingLevel);
                        }
                    }

                    // set lightning attributes so we have access to variables in the view
                    component.set("v.groupingLevelToLabel", groupingLabels)
                    component.set("v.reportData", returnValue);
                    component.set("v.factMap", returnValue.factMap);
                    
                    //set column headers, this assumes that they are returned in order
                    var tableHeaders = [];
                    for( var i = 0; i < returnValue.reportMetadata.detailColumns.length; i++ ){
                        var fieldAPIName = returnValue.reportMetadata.detailColumns[i];
                        var fieldLabel = returnValue.reportExtendedMetadata.detailColumnInfo[fieldAPIName].label;
                        tableHeaders.push(fieldLabel)
                    }
                    component.set("v.columnLabels", tableHeaders);

                    //hide spinner, reveal data
                    $A.util.addClass(loadingSpinner, 'slds-hide');
                    $A.util.removeClass(reportContainer, 'slds-hide');
                }
                else {
                    component.set("v.errorMessage", $A.get("$Label.c.RE_NoData"));
                    $A.util.addClass(loadingSpinner, 'slds-hide');
                    $A.util.removeClass(reportError, 'slds-hide');
                }
            }
            else {
                component.set("v.errorMessage", $A.get("$Label.c.RE_UnavailableData"));
                $A.util.addClass(loadingSpinner, 'slds-hide');
                $A.util.removeClass(reportError, 'slds-hide');
            }
        })
        $A.enqueueAction(action);
    }
})