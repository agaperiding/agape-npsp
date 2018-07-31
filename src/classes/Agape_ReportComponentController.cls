public with sharing class Agape_ReportComponentController {
    /*******************************************************************************************************
    * @description Returns report data for the given report Id. If a record Id and a record id filter column is provided
    *              then we will attempt to filter the report and return the reprt data.
    * 
    * @param reportId Id of the report to be returned
    *        recordId Id of the record the report should be filtered by
    *        recordIdFilterColumn Report field column value to use for record filtering
    */
	@auraenabled
    public static String getReportMetadata(Id reportId, Id recordId, String recordIdFilterColumn) {
    	// If the record Id is null then we know this is not a record page
    	// Return the report as is
    	if (recordId == null) {
        	return JSON.serializePretty(Reports.ReportManager.runReport(reportId, true));
    	}

    	// Return null if filter column is missing
    	if (recordIdFilterColumn == null)
    		return null;

    	// Get Report Metadata
    	Reports.ReportDescribeResult describe = Reports.ReportManager.describeReport(reportId);
    	Reports.ReportMetadata reportMetadata = describe.getReportMetadata();

    	// Find the filter column to set the record id
    	List<Reports.ReportFilter> filters = reportMetadata.getReportFilters();
    	for (Reports.ReportFilter filter : filters) {
    		if (filter.getColumn() == recordIdFilterColumn) {
    			filter.setValue(recordId);
    			continue;
    		}
    	}

    	// Return report data with new filter value
    	return JSON.serializePretty(Reports.ReportManager.runReport(reportId, reportMetadata, true));
    }
}