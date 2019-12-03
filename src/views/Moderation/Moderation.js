require('./moderation.scss')
import React from 'react'
import PropTypes from 'prop-types'
import {Button} from 'material-ui'
import {FormattedMessage, injectIntl} from 'react-intl'
import EventTable from '../../components/EventTable/EventTable'
import {connect} from 'react-redux'
import {isNull, zipObject, each} from 'lodash'
import constants from '../../constants'
import {
    appendEventDataWithSubEvents,
    EventQueryParams,
    fetchEvents,
    getEventDataFromIds,
    getEventsWithSubEvents,
} from '../../utils/events'
import {getSelectedRows, getSortColumnName, getSortDirection} from '../../utils/table'
import showConfirmationModal from '../../utils/confirm'
import {confirmAction, setFlashMsg as setFlashMsgAction} from '../../actions/app'
import {hasAffiliatedOrganizations} from '../../utils/user'
import {push} from 'react-router-redux'

const {TABLE_DATA_SHAPE, PUBLICATION_STATUS} = constants

export class Moderation extends React.Component {

    state = {
        draftData: {
            events: [],
            count: null,
            paginationPage: 0,
            pageSize: 10,
            fetchComplete: true,
            sortBy: 'last_modified_time',
            sortDirection: 'desc',
            tableColumns: ['checkbox', 'name', 'publisher', 'event_time', 'last_modified_time', 'validation'],
            selectedRows: [],
            invalidRows: [],
        },
        publishedData: {
            events: [],
            count: null,
            paginationPage: 0,
            pageSize: 10,
            fetchComplete: true,
            sortBy: 'date_published',
            sortDirection: 'desc',
            tableColumns: ['name', 'publisher', 'event_time', 'date_published'],
        },
    }

    componentDidMount() {
        const {user} = this.props

        if (!isNull(user) && hasAffiliatedOrganizations(user)) {
            this.fetchTableData(['draft', 'published'])
        }
    }

    componentDidUpdate(prevProps) {
        const {user, routerPush} = this.props
        const oldUser = prevProps.user

        // redirect to home if user logged out
        if (isNull(user) && oldUser !== user) {
            routerPush('/')
        }
        // fetch data if user logged in
        if (isNull(oldUser) && user && hasAffiliatedOrganizations(user)) {
            this.fetchTableData(['draft', 'published'])
        }
    }

    /**
     * Fetches the data for the given table(s) and saves it to the state
     * @param tables    The table(s) that data should be fetched for
     */
    fetchTableData = (tables) => {
        // promises containing the table data
        const fetchedData = tables.map(table => {
            const queryParams = this.getDefaultEventQueryParams(table)
            queryParams.include = table === 'draft' ? 'keywords,sub_events' : null
            queryParams.admin_user = table === 'draft' ? true : null

            return fetchEvents(queryParams)
        })

        this.setLoading(false, tables)

        Promise.all(fetchedData)
            .then(values => {
                const tableKeys = tables.map(table => `${table}Data`)
                // map fetched data to the tables
                const tableData = zipObject(tableKeys, values)
                let updatedState = {...this.state}

                each(tableData, (values, key) => {
                    updatedState[key] = {
                        ...this.state[key],
                        events: values.data.data,
                        count: values.data.meta.count,
                        selectedRows: [],
                    }
                })

                this.setState({...updatedState})
            })
            .finally(() => this.setLoading(true, tables))
    }

    /**
     * Handles table row selection
     * @param checked   Whether the row was selected or de-selected
     * @param id        Event ID of the selected row
     * @param table     The table that the row was selected in
     * @param selectAll Whether all rows should be selected
     */
    handleRowSelect = (checked, id, table, selectAll = false) => {
        const tableData = this.state[`${table}Data`]
        const {invalidRows} = tableData
        const selectedRows = getSelectedRows(tableData, checked, id, table, selectAll, invalidRows)

        // set selected rows
        this.setState({[`${table}Data`]: {
            ...tableData,
            selectedRows,
        }})
    }

    /**
     * Handles invalid rows
     * @param eventId
     * @param table
     */
    handleInvalidRows = (eventId, table) => {
        const {invalidRows} = this.state[`${table}Data`]

        if (!invalidRows.includes(eventId)) {
            this.setState(state => {
                const tableData = state[`${table}Data`]
                const updatedInvalidRows = [...state[`${table}Data`].invalidRows, eventId]

                return {[`${table}Data`]: {
                    ...tableData,
                    invalidRows: updatedInvalidRows,
                }}
            })
        }
    }

    /**
     * Handles table column sort changes
     * @param columnName    The column that should be sorted
     * @param table         The table that the sorting was changed for
     */
    handleSortChange = (columnName, table) => {
        const tableData = this.state[`${table}Data`]
        const oldSortBy = tableData.sortBy
        const oldSortDirection = tableData.sortDirection
        const sortBy = getSortColumnName(columnName)
        const sortDirection = getSortDirection(oldSortBy, columnName, oldSortDirection)
        const queryParams = this.getDefaultEventQueryParams(table)
        queryParams.setSort(sortBy, sortDirection)

        this.setLoading(false, [table])

        fetchEvents(queryParams)
            .then(response => {
                this.setState({[`${table}Data`]: {
                    ...tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    sortBy: columnName,
                    sortDirection: sortDirection,
                }})
            })
            .finally(() => this.setLoading(true, [table]))
    }

    /**
     * Handles table pagination page changes
     * @param event
     * @param newPage   The new page number
     * @param table     The table that the pagination page was changed for
     */
    handlePageChange = (event, newPage, table) => {
        const tableData = this.state[`${table}Data`]
        const queryParams = this.getDefaultEventQueryParams(table)
        queryParams.page = newPage + 1

        this.setLoading(false, [table])

        fetchEvents(queryParams)
            .then(response => {
                this.setState({[`${table}Data`]: {
                    ...tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: newPage,
                }})
            })
            .finally(() => this.setLoading(true, [table]))
    }

    /**
     * Handles table page size changes
     * @param   event   Page size selection event data
     * @param   table   The table that the page size was changed for
     */
    handlePageSizeChange = (event, table) => {
        const tableData = this.state[`${table}Data`]
        const pageSize = event.target.value
        const queryParams = this.getDefaultEventQueryParams(table)
        queryParams.pageSize = pageSize

        this.setLoading(false, [table])

        fetchEvents(queryParams)
            .then(response => {
                this.setState({[`${table}Data`]: {
                    ...tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: 0,
                    pageSize: pageSize,
                }})
            })
            .finally(() => this.setLoading(true, [table]))
    }

    /**
     * Sets the loading state of the given tables
     * @param fetchComplete Whether the fetch has completed
     * @param tables        Tables for which the loading state should be updated
     */
    setLoading = (fetchComplete, tables) => {
        const updatedState = {...this.state}
        tables.forEach(table => updatedState[`${table}Data`].fetchComplete = fetchComplete)
        this.setState(updatedState)
    }

    /**
     * Returns the publication status for the given table
     * @param table
     * @returns {string}
     */
    getPublicationStatus = (table) => {
        if (table === 'draft') {
            return PUBLICATION_STATUS.DRAFT
        }
        if (table === 'published') {
            return  PUBLICATION_STATUS.PUBLIC
        }
    }

    /**
     * Return the default query params to use when fetching event data
     * @returns {EventQueryParams}
     */
    getDefaultEventQueryParams = (table) => {
        const {user: {affiliatedOrganizations}} = this.props
        const {pageSize, sortBy, sortDirection} = this.state[`${table}Data`]

        const queryParams = new EventQueryParams()
        queryParams.super_event = 'none'
        queryParams.publication_status = this.getPublicationStatus(table)
        queryParams.setPublisher(affiliatedOrganizations)
        queryParams.page_size = pageSize
        queryParams.setSort(sortBy, sortDirection)

        return queryParams
    }

    /**
     * Returns an action button for the given type
     * @param table     The table to get the data for
     * @param action    Button action
     * @returns {Element}
     */
    getActionButton = (table, action) => {
        const {selectedRows} = this.state[`${table}Data`]
        let buttonColor = 'primary'

        if (action === 'delete') {
            buttonColor = 'accent'
        }

        return <Button
            key={`${table}-${action}-button`}
            raised
            color={buttonColor}
            className="draft-actions--button"
            disabled={selectedRows.length === 0}
            onClick={() => this.runConfirmAction(table, action)}
        >
            {selectedRows.length > 1 &&
            <React.Fragment>
                <FormattedMessage id={`${action}-events`}/>
                <span className="draft-actions--button-count">{`(${selectedRows.length})`}</span>
            </React.Fragment>
            }
            {selectedRows.length <= 1 &&
                <FormattedMessage id={`${action}-event`}/>
            }
        </Button>
    }

    /**
     * Opens a confirmation modal and runs the given action
     * @param table     The table to run the action for
     * @param action    Action to run
     */
    runConfirmAction = (table, action) => {
        const {confirm, intl, setFlashMsg} = this.props
        const tableData = this.state[`${table}Data`]
        const {events, selectedRows} = tableData
        const publicationStatus = this.getPublicationStatus(table)
        let eventData = getEventDataFromIds(selectedRows, events)

        // opens the confirm modal
        const doConfirm = (data) => {
            showConfirmationModal(data, action, confirm, intl, publicationStatus)
                .then(() => {
                    // we need to update the data of both tables if we published events
                    action === 'publish'
                        ? this.fetchTableData(['draft', 'published'])
                        : this.fetchTableData([table])
                    // show flash message after running action
                    setFlashMsg(`event-creation-${action}-success`, 'success')
                })
        }

        // get the id's of events that have sub events
        const eventsWithSubEvents = getEventsWithSubEvents(eventData)

        // we need to append sub event data to the event data if we're running actions for recurring / umbrella events
        eventsWithSubEvents.length > 0
            ? appendEventDataWithSubEvents(eventData, eventsWithSubEvents)
                .then((appendedData) => doConfirm(appendedData))
            : doConfirm(eventData)
    }

    render() {
        const {draftData, publishedData} = this.state
        const {user} = this.props
        const draftActionButtons = ['delete', 'publish']
        const moderationTables = [
            {
                name: 'draft',
                data: draftData,
            },
            {
                name: 'published',
                data: publishedData,
            },
        ]

        return (
            <div className="container">
                <h1><FormattedMessage id="moderation-page"/></h1>
                {!user &&
                    <p><FormattedMessage id="login" /> <FormattedMessage id="events-management-prompt" /></p>
                }
                {user && moderationTables.map(table => (
                    <React.Fragment key={`${table.name}-table-fragment`}>
                        <h2><FormattedMessage id={`moderation-page-${table.name}-heading`}/></h2>
                        <EventTable
                            tableName={table.name}
                            tableColumns={table.data.tableColumns}
                            events={table.data.events}
                            user={user}
                            fetchComplete={table.data.fetchComplete}
                            count={table.data.count}
                            pageSize={table.data.pageSize}
                            paginationPage={table.data.paginationPage}
                            sortBy={table.data.sortBy}
                            sortDirection={table.data.sortDirection}
                            selectedRows={table.name === 'draft' ? table.data.selectedRows : undefined}
                            handleRowSelect={this.handleRowSelect}
                            handleInvalidRows={this.handleInvalidRows}
                            handlePageChange={this.handlePageChange}
                            handlePageSizeChange={this.handlePageSizeChange}
                            handleSortChange={this.handleSortChange}
                        />
                        {table.name === 'draft' && table.data.events.length > 0 &&
                            <div className="draft-actions">
                                {draftActionButtons.map(action => this.getActionButton(table.name, action))}
                            </div>
                        }
                    </React.Fragment>
                ))}
            </div>
        )
    }
}

Moderation.propTypes = {
    user: PropTypes.object,
    confirm: PropTypes.func,
    routerPush: PropTypes.func,
    setFlashMsg: PropTypes.func,
    intl: PropTypes.object,
    draftData: TABLE_DATA_SHAPE,
    publishedData: TABLE_DATA_SHAPE,
}

const mapStateToProps = (state) => ({
    user: state.user,
})

const mapDispatchToProps = (dispatch) => ({
    confirm: (msg, style, actionButtonLabel, data) => dispatch(confirmAction(msg, style, actionButtonLabel, data)),
    routerPush: (url) => dispatch(push(url)),
    setFlashMsg: (id, status) => dispatch(setFlashMsgAction(id, status)),
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Moderation));
