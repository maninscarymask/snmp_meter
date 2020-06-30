# v0.30.8 06/30/2020
# SNMP Retrieval Script to pull Serial Number, Mono and Color counts from
# Sharp, with eventual additions of Lexmark and HP machines.
# 
# Copyright 2020, Robert McLaughlin, All rights reserved.
# 
# Note: Servers without the snmpget program in $PATH will need to be changed to .\snmpget
#
# The syntax for the commands is specifically for snmpget from SyslogWatcher:
#     https://syslogwatcher.com/cmd-tools/snmp-get/
#

# Specify where we are
$company = "Company Name"

# stupid output file
$output = ".\temp.txt"

# added along with the network scan to determine which machines are actual printers
$ip_list = ".\ip_list.txt"

# Date formatted to be used as a key name for scans
$datecode = (get-date -Format "yyyy-MM-dd HH:00")

# We want an ORDERED list!
#$global:scan=New-Object System.Collections.Specialized.OrderedDictionary
$global:scan = @{}

function GetOID($oid) {
    # SyslogWatcher version of snmpget (Windows)
    .\snmpget -r:$ip -t:$t -v:$v -q -o:$oid

    # SNMPLabs version of snmpget (Linux, macOS, etc.)
    #snmpget -v $v -t $t -c "public" -O Uvq $ip $oid
}

function GetTree($oid_start, $oid_end) {
    # SyslogWatcher version of snmpwalk (Windows)
    .\snmpwalk -r:$ip -t:$t -v:$v -q -os:$oid_start -op:$oid_end

    # SNMPLabs version of snmpwalk (Linux, macOS, etc.)
    #snmpwalk -v $v -t $t -O Uvq $ip $oid_start
}

# Reboots machine if capable
function Reset {
    # SyslogWatcher version of snmpset (Windows)
    .\snmpset -r:$ip -v:$v -c:"public" -q -o:.1.3.6.1.2.1.43.5.1.1.3.1 -tp:int -val:4
    
    # SNMPLabs version of snmpset (Linux, macOS, etc.)
    #snmpset -v 2c -c "public" $ip .1.3.6.1.2.1.43.5.1.1.3.1 i 4
}

# Checks the status of the covers/doors
function CoverStatus {
    if ($cover_name -is [array]) {
        For ($i = 0; $i -lt $cover_name.Length; $i++) {
            if ($cover_status[$i] -lt 4) {
                $open += @($cover_name[$i])
            }
        }
        $covers = $open -join ", "
        $global:scan += @{"Open covers" = $covers}
    }
    else {
        if ($cover_status -lt 4) {
            $global:scan += @{"Open Covers" = $cover_name}
        }
    }
}

# Checks the Ready state of the machine
function ReadyStatus {
    if ($status_name -is [array]) {
        For ($i = 0; $i -lt $status_name.Count; $i++) {
            if ($status_active[$i] -eq 500) {
                $status_output += @($status_name[$i])
            }
        }
        #Write-Output $output
        $alert_status = $status_output -join ", "
        #Write-Output $alert_status
        $global:scan += @{"Status" = $alert_status}
    }
    else {
        if ($status_name.Length -eq 0) {
            $alert_status = ( GetOID ".1.3.6.1.2.1.43.16.5.1.2.1.1" )
            $global:scan += @{"Status" = $alert_status}
        }
    }
}

# Checks the supplies
function SupplyStatus {
    if ($supply_names -is [array]) {
        if ($model.StartsWith("SHARP")) {
            For ($i = 0; $i -lt $supply_names.Length; $i++) {
                # Add each element to the scan array
                $global:scan += @{$($supply_names[$i]) = $($supply_used[$i])}
            }
            #Write-Output $scan
        }
        if ($model.StartsWith("HP") -or $model.StartsWith("hp") -or $model.StartsWith("Lexmark")) {
            # These little guys only return hex, so have to manually convert it.  Used to just replace hex strings (commented)
            if ($model.Contains("M527") -or $model.Contains("M607") -or $model.Contains("M553")) {
                $supply_names = $supply_names -replace '\s',''
                #$supply_names=@("Black Cartridge 87A HP CF287A","Document Feeder Kit HP B5L52A","Clean Rollers HP None")
                #$supply_names=@("Black Cartridge 508A HP CF360A","Cyan Cartridge 508A HP CF361A","Magenta Cartridge 508A HP CF363A","Yellow Cartridge 508A HP CF362A","Fuser Kit HP 110V-B5L35A, 220V-B5L36A","Toner Collection Unit HP B5L37A")
                ForEach ($item in $supply_names) {
                    if ($item.StartsWith("0115")) {
                        $supply_names += @(($item-split"(..)"|?{$_}|%{[char][convert]::ToInt16($_,16)})-join"")
                    }
                    else {
                        Write-Output "Not an ASCII string!"
                    }
                }
            }
            #write-output $supply_names

            For ($i = 0; $i -lt $supply_names.Length; $i++) {
                $supply_usage = [System.Math]::Ceiling(($supply_used[$i] / $supply_yield[$i]) * 100)
                #Write-Output "$($supply_names[$i]): $($supply_used[$i])/$($supply_yield[$i])=$($supply_usage)%"
                # Add each element to the scan array
                $global:scan += @{$supply_names[$i] = $supply_usage}
            }
            #Write-Output $scan
        }
    }
    else {
        $supply_usage = ([System.Math]::Ceiling(($supply_used / $supply_yield) * 100))
        #Write-Output "$($supply_names): $($supply_used)/$($supply_yield)=$($supply_usage)%"
        # Add each element to the scan array
        $global:scan += @{$($supply_names) = $($supply_usage)}
        #Write-Output $scan
    }
}

# Checks page counts
function CountStatus {
    if ($count_values -is [array]) {
        For ($i = 0; $i -lt $count_names.Count; $i++) {
            #write-host "$($count_names[$i]):  $($count_values[$i])"
            # Add each element to the scan array
            $global:scan += @{$($count_names[$i]) = $($count_values[$i])}
        }
        $total_count = ( GetOID ".1.3.6.1.2.1.43.10.2.1.4.1.1" )
        $global:scan += @{"Total Count" = "$total_count"}
    }
    else {
        $global:scan += @{"Total Count" = "$count_values"}
    }
}

# This should really be done in another script, to make sure the machines we scan are correct.  The Fiery as well as older SHARP machines tend not to report properly.
function DiscoverMachines {
    # Get the current IP address, drop the last octet and set it to 0, so we know the network
    $local_ip_address = (ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}')
    $nwip = $local_ip_address.Split('.')
    $nwip[-1] = 0
    $network_ip_address = $nwip -join "."

    # Finds all machines with port 9100 open (IOW: all printers have this port open)
    sudo nmap -sS -p 9100 "$network_ip_address/24" --open -oG - | awk '{print $2}' | grep -v "[a-z]" | uniq > $ip_list
}

function JSONOutput {
    $machine += @{
        "Model"            = $model
        "Serial Number"    = $serial
        "Asset Number"     = $asset
        "IP Address"       = "$ip"
        "Hardware Address" = $mac
        "Firmware Version" = $fw
        "Latest Scan"      = $datecode
        "Location"         = $location
    }

    $global:scan = @{
        "Date" = $datecode
    }

    CountStatus
    ReadyStatus
    SupplyStatus
    CoverStatus

    # Machine records
    $machine | ConvertTo-Json -Depth 2 | Out-File -Encoding ascii -Append -FilePath $output
    Invoke-RestMethod -Uri https://xxx-xxx-xxx.firebaseio.com/$company/machines/$ipaddr.json -Method PATCH -ContentType 'Text' -InFile $output
    rm $output

    # Scan records
    $global:scan | ConvertTo-Json -Depth 2 | Out-File -Encoding ascii -Append -FilePath $output
    Invoke-RestMethod -Uri https://xxx-xxx-xxx.firebaseio.com/$company/scans/$ipaddr/$datecode.json -Method PATCH -ContentType 'Text' -InFile $output
    rm $output

    # Asset to sanitized ipaddr link
    [pscustomobject]@{
        "$asset" = "$ipaddr";
    } | ConvertTo-Json -Depth 2 | Out-File -Encoding ascii -Append -FilePath $output
    Invoke-RestMethod -Uri https://xxx-xxx-xxx.firebaseio.com/$company/asset.json -Method PATCH -ContentType 'Text' -InFile $output
    rm $output
}

# Clear out the variables so things don't linger,
# despite the fact this looks like it doesn't actually do anything...
function Clear-Vars {
    #$global:scan=@{}
    clear-variable asset
    clear-variable count_names
    clear-variable count_values
    clear-variable cover_name
    clear-variable cover_status
    clear-variable datecode
    clear-variable fw
    #clear-variable ipaddr
    #clear-variable mac
    clear-variable model
    #clear-variable output
    clear-variable serial
    clear-variable status_active
    #clear-variable status_inactive
    clear-variable status_name
    clear-variable supply_names
    #clear-variable supply_usage
    clear-variable supply_used
    clear-variable supply_yield
    clear-variable t
    clear-variable v
}

#DiscoverMachines

foreach ($ip in get-content $ip_list) {
    # Firebase does not like periods, so change the IP delimiter to dash.  Still human-readable, so works fine.
    $ipaddr = $ip.replace(".", "-")

    # SNMP version should stay at v1 unless required to be v2
    $v = 1

    # Timeout should be short, as we don't care to wait
    $t = 1

    # Check if things are offline or not
    if (!(Test-Connection $ip -Count 1 -Quiet)) {
        $status = "Offline"
        $global:scan = @{"Status" = $status}
        #write-host "$ip | $alert_status"
        #write-host ""

        # This only updates if there's a change.
        [pscustomobject]@{
            "IP Address" = "$ip";
            "Status"     = "$status";
        } | ConvertTo-Json -Depth 2 | Out-File -Encoding ascii -Append -FilePath $output

        Invoke-RestMethod -Uri https://xxx-xxx-xxx.firebaseio.com/$company/offline/$ipaddr.json -Method PATCH -ContentType 'Text' -InFile $output
        rm $output

        # Keep a running history of the offline status, so we can determine trends
        [pscustomobject]@{
        "$datecode" = "Offline";
        } | ConvertTo-Json -Depth 2 | Out-File -Encoding ascii -Append -FilePath $output

        # Getting an idea of when the machines are offline
        Invoke-RestMethod -Uri https://xxx-xxx-xxx.firebaseio.com/$company/machines/$ipaddr/History.json -Method PATCH -ContentType 'Text' -InFile $output
        rm $output
    }
    else {
        # Online
        $status = "Online"

        # And let the db know it...
        Invoke-RestMethod -Uri https://xxx-xxx-xxx.firebaseio.com/$company/offline/$ipaddr.json -Method Delete -ContentType 'Text'

        # An easy method to see if a machine requires SNMPv2
        $model = ( GetOID ".1.3.6.1.2.1.25.3.2.1.3.1" )
        if ($model.StartsWith("%Failed")) {
            $v = 2
            $model = ( GetOID ".1.3.6.1.2.1.25.3.2.1.3.1" )
        }

        $location = ( .\snmpget -r:$ip -v:1 -t:1 -q -o:.1.3.6.1.2.1.1.6.0 )
        if ($location.StartsWith("%Failed") -or $location.length -eq 0) {
            $location = "no location data"
        }

        $serial = ( GetOID ".1.3.6.1.2.1.43.5.1.1.17.1" )

        # Supply names.  All machines show at least "Black Toner"
        $supply_names = ( GetTree ".1.3.6.1.2.1.43.11.1.1.6.1" ".1.3.6.1.2.1.43.11.1.1.6.2" )
        if ($supply_names.Contains("%Failed")) {
            $supply_names = ( GetTree ".1.3.6.1.2.1.43.11.1.1.6.1" ".1.3.6.1.2.1.43.11.1.1.6.2" )
        }
        $supply_yield = ( GetTree ".1.3.6.1.2.1.43.11.1.1.8.1" ".1.3.6.1.2.1.43.11.1.1.8.2" )
        $supply_used = ( GetTree ".1.3.6.1.2.1.43.11.1.1.9.1" ".1.3.6.1.2.1.43.11.1.1.9.2" )

        for ($i=0; $i -lt $supply_names.Length; $i++) {
            if ($supply_names -is [array]) {
                # Sanitizing the names, since "Photoconductive" is just silly...  Makes the JS easier.
                if ($supply_names[$i].StartsWith("Black") -and $supply_names[$i].Contains("Drum")) {
                    $supply_names[$i] = "Black Drum"
                }
                if ($supply_names[$i].StartsWith("Cyan") -and $supply_names[$i].Contains("Drum")) {
                    $supply_names[$i] = "Cyan Drum"
                }
                if ($supply_names[$i].StartsWith("Magenta") -and $supply_names[$i].Contains("Drum")) {
                    $supply_names[$i] = "Magenta Drum"
                }
                if ($supply_names[$i].StartsWith("Yellow") -and $supply_names[$i].Contains("Drum")) {
                    $supply_names[$i] = "Yellow Drum"
                }
            }
        }

        $count_values = ( GetTree ".1.3.6.1.4.1.2385.1.1.19.2.1.3.5.4" ".1.3.6.1.4.1.2385.1.1.19.2.1.3.5.5" )
        $count_names = ( GetTree ".1.3.6.1.4.1.2385.1.1.19.2.1.4.5.4" ".1.3.6.1.4.1.2385.1.1.19.2.1.4.5.5" )
    
        # Status alerts, such as "Ready"
        $status_active = ( GetTree ".1.3.6.1.2.1.43.17.6.1.2" ".1.3.6.1.2.1.43.17.6.1.3" )
        $status_name = ( GetTree ".1.3.6.1.2.1.43.17.6.1.5" ".1.3.6.1.2.1.43.17.6.1.6" )

        # Doors have status alerts too!
        $cover_name = ( GetTree ".1.3.6.1.2.1.43.6.1.1.2" ".1.3.6.1.2.1.43.6.1.1.3" )
        $cover_status = ( GetTree ".1.3.6.1.2.1.43.6.1.1.3" ".1.3.6.1.2.1.43.6.1.1.4" )

        # Firebase compatibility
        #$ipaddr = $ip.replace(".","-")
        $datecode = (get-date -Format "yyyy-MM-dd HH:00")

        if ($model.StartsWith("SHARP")) {
            $mac = (( GetOID ".1.3.6.1.2.1.2.2.1.6.1" | findstr [.] )[2..18] -join "").replace(" ", ":") #findstr [0-9, a-z, A-Z]

            # .1.3.6.1.4.1.2385.1.1.1.2.1.11.1 is the "Machine ID Setting" in service mode
            $asset = ( GetOID ".1.3.6.1.4.1.2385.1.1.1.2.1.11.1" )
            if ($asset.Length -eq 0 -or $asset.Length -gt 4) {
                # .1.3.6.1.2.1.1.5.0 is actually the Machine Identification "Name" 
                $asset = ( GetOID ".1.3.6.1.2.1.1.5.0" ) # Name
                if ($asset.Length -eq 0 -or $asset.StartsWith("%Failed")){
                    $asset = ( GetOID ".1.3.6.1.2.1.43.5.1.1.16.1" )
                }
                #$asset = ( GetOID ".1.3.6.1.2.1.1.6.0" ) # Location
            }

            if ($model.Contains("C300W")) {
                $count_names = ( GetTree ".1.3.6.1.4.1.2385.1.1.19.2.1.4.8.4" ".1.3.6.1.4.1.2385.1.1.19.2.1.4.8.5" )
                $count_values = ( GetTree ".1.3.6.1.4.1.2385.1.1.19.2.1.3.8.4" ".1.3.6.1.4.1.2385.1.1.19.2.1.3.8.5" )
            }
            
            $fw = ( GetOID ".1.3.6.1.2.1.43.15.1.1.6.1.1" ) # for SHARP
            if ($fw.StartsWith("%Failed")) {
                $fw = "Not found"
            }

            JSONOutput
        }

        if ($model.StartsWith("HP") -or $model.StartsWith("hp")) {
            # Turning these off for a while...
            continue
            $mac = (( GetOID ".1.3.6.1.2.1.2.2.1.6.2" | findstr [.] )[2..18] -join "").replace(" ", ":") #findstr [0-9, a-z, A-Z]
            
            $asset = ( GetOID ".1.3.6.1.4.1.11.2.3.9.4.2.1.1.3.12.0" )[0].substring(55)

            $fw = ( GetOID ".1.3.6.1.4.1.11.2.3.9.4.2.1.1.3.6.0" )
            if ($fw.StartsWith("%Failed")) {
                $fw = ( GetOID ".1.3.6.1.4.1.11.2.3.9.4.2.1.1.3.5.0" )[0].substring(55)
            }
            else {
                $fw = $fw[0].substring(55) # for HP
            }
            
            JSONOutput
        }

        if ($model.StartsWith("Lexmark")) {
            # Turning these off for a while...
            continue
            $model = ( GetOID ".1.3.6.1.4.1.641.2.1.2.1.2.1" )
            $mac = (( GetOID ".1.3.6.1.2.1.55.1.5.1.8.2" | findstr [.] )[2..18] -join "").replace(" ", ":") #findstr [0-9, a-z, A-Z]
            $fw = ( GetOID ".1.3.6.1.4.1.641.2.1.2.1.4.1" )
            $serial = ( GetOID ".1.3.6.1.4.1.641.2.1.2.1.6.1" )
            $asset = ( GetOID ".1.3.6.1.4.1.641.2.1.2.1.7.1" )
            $status_name = ( GetOID ".1.3.6.1.2.1.43.16.5.1.2.1.1" )

            JSONOutput
        }

        if ($model.StartsWith("Panasonic")) {
            # Turning these off for a while...
            continue
            $mac = (( GetOID ".1.3.6.1.2.1.2.2.1.6.1" | findstr [.] )[2..18] -join "").replace(" ", ":") #findstr [0-9, a-z, A-Z]

            $fw = ( GetOID ".1.3.6.1.2.1.43.15.1.1.6.1.1" ) # for SHARP
            if ($fw.StartsWith("%Failed")) {
                $fw = "Not found"
            }

            $serial = "Not Found"
            $asset = "Not found"
            
            #JSONOutput
        }
    } 
    Clear-Vars
}
