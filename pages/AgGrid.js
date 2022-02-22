import { React, useEffect, useState } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const PREVIEW_ROWS = 10
const ROW_INCREMENT = 10
const MAX_MEM = 50

const AgGrid = (props) => {
    const [fieldNames, setFieldNames] = useState([])
    const cursor = props.cursor
    const scrollOption = props.scrollOption

    const maxBlocksInCache = scrollOption === 'Windowed Scroll' ? MAX_MEM / ROW_INCREMENT : undefined
    const [datasource, setDatasource] = useState(null)

    useEffect(() => {
        const newDatasource = createDatasource(cursor)
        setDatasource(newDatasource);
    }, [cursor])

    function createDatasource(cursor) {
        return {
            getRows: params => {
                var num = params.request.startRow == undefined ?
                    MAX_MEM / ROW_INCREMENT - params.request.startRow
                    : params.request.endRow - params.request.startRow

                var rowCount
                if (scrollOption === 'Result Preview') {
                    rowCount = PREVIEW_ROWS
                } else {
                    rowCount = params.request.endRow + ROW_INCREMENT
                    if (scrollOption === 'Limited Scroll' && rowCount > MAX_MEM) {
                            rowCount = MAX_MEM
                    }
                } 

                cursor.read(num, (err, rows) => {
                    if (err) {
                        console.log("Error caught in cursor.read: " + err.message)
                        params.fail()
                        return
                    } else {
                        if (rows.length > 0) {
                            setFieldNames(Object.keys(rows[0]))
                        }
                        if (rows.length < ROW_INCREMENT) {
                            rowCount = rows.length + params.request.startRow
                        }
                        params.success({ rowData: rows, rowCount: rowCount })
                    }
                })
            }
        };
    }
    const getAgGridColumns = (fieldNames) => {
        return fieldNames.map(name => <AgGridColumn field={name} key={name} />)
    }
    return (
        <div className="ag-theme-alpine" style={{ height: 600, width: 800 }}>
            <AgGridReact
                serverSideDatasource={datasource}
                rowModelType={'serverSide'}
                serverSideStoreType={'partial'}
                cacheBlockSize={ROW_INCREMENT}
                maxBlocksInCache={maxBlocksInCache}
            >
                {getAgGridColumns(fieldNames)}
            </AgGridReact>
        </div>)
};

export default AgGrid;