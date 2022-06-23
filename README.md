# SNMP Meter Interface

This project was created to make managing a fleet of MFPs and printers more easily, giving meter data and current toner level data in an easy-to-read interface.

<img src="snmp_meter_ui.png" width=450px>

## Data capture

The Powershell script should be run on a machine using Task Scheduler, given a reasonable executable interval.  A good rule of thumb is to use as short an interval as you can safely mitigate disaster.  An example would be 3hr intervals during workdays, such as 0600, 0900, 1200, 1500 and 1800.  Any more than that and you may get too many scans with no change in data.

The JavaScript portion is simply a "pretty" interface that displays all of the information per-machine in an easy-to-understand format.

## Informational text

- Model
- Serial Number
- Asset Number
- IP Address
- MAC Address
- Firmware Version
- Location (if set up in the machine)
- Latest Scan date (such as "2020/06/30 12:00")

The counts per type of prints are also given:
- Black and white
- Color
- Total (if also supplied by the machine, can be used to determine if something weird is going on)

## Toner level bars

While I prefer having color-coded bars, some people prefer straight text, so I have included both.  These display based on the type of machine, whether monochrome or color, separated by type (toner, developer, drum, maintenance items):

- Cyan
- Magenta
- Yellow
- Black
- Waste Bottle

## Graphs

Each historical datapoint, such as a meter-reading or toner level, is kept in order to be able to graph its change over time:

- Toner graph
- Developer graph
- Drum Graph
- Usage graph

## Configuration

In order to get this to work for you, you need to change the Powershell to point to your Firebase DB, then also set your company name.  Make sure the snmpget/snmpwalk programs are in the same folder as the script.  Add the ps1 script to Task Scheduler with a 3hr interval, then let manually start it.

For the UI component, change "Company Name" and the Firebase DB link in data.js.  Change the displayed "Company Name" in the index.html file as well.

Once the Powershell script has created the appropriate nodes on the Firebase DB, the UI should be able to pull the data and display it.

## Aggregation

<img src="meter.png" width=450px>

This page, utilizing similar JS, shows all machines and their respective toner/developer/drum values and all other machine data so it can be sorted as an overview of the entire fleet.  Varying colors denotes machines who are low, very low or out.  The ID numbers are linked on the left in order to open up a contextual page just about that machine, allowing for the above-mentioned historical data.

## Just Low

<img src="low.png" width=450px>


This page will only show the low supplies, organized by type.  It has a section for toners, drums, developers, as well as waste-toner containers and even a section for "completely out" supplies.  These would be considered priority.
