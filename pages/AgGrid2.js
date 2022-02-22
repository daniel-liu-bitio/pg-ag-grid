'use strict';

import React, { useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';

const AgGrid2 = (props) => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const pool = props.pool
    const query = props.query

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        const updateData = (data) => {
            var datasource = createServerSideDatasource(pool);
            params.api.setServerSideDatasource(datasource);
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) =>
                resp.json()
            )
            .then((data) => {
                updateData(data)
            });
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div
                id="myGrid"
                style={{
                    height: '100%',
                    width: '100%',
                }}
                className="ag-theme-alpine-dark"
            >
                <AgGridReact
                    defaultColDef={{
                        flex: 1,
                        minWidth: 100,
                    }}
                    rowModelType={'serverSide'}
                    onGridReady={onGridReady}
                >
                    <AgGridColumn field="athlete" minWidth={220} />
                    <AgGridColumn field="country" minWidth={200} />
                    <AgGridColumn field="year" />
                    <AgGridColumn field="sport" minWidth={200} />
                    <AgGridColumn field="gold" />
                    <AgGridColumn field="silver" />
                    <AgGridColumn field="bronze" />
                </AgGridReact>
            </div>
        </div>
    );
};

function createServerSideDatasource(pool) {
    return {
        getRows: function (params) {
            console.log('[Datasource] - rows requested by grid: ', params.request);
            if (pool) {
                var response = pool.query("SELECT * FROM customer");
                console.log(response)
                if (response.success) {
                    params.success({ rowData: response.rows });
                } else {
                    params.fail();
                }
            } else {
                params.fail();
            }
        },
    };
}

export default AgGrid2;