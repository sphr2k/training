resource "guacamole_connection_rdp" "connection" {
  count = var.participant_count
  name = "${var.event_name}-${format("%02d", count.index + 1)}"
  parent_identifier = "ROOT"
  attributes {
    max_connections = 1
    max_connections_per_user = 1
  }
  parameters {
    hostname = "172.19.x.${format(count.index + 1)}"
    username = "${var.event_name}-${format("%02d", count.index + 1)}"
    password ="geheim"
    port = 3389
    timezone = "Europe/Berlin"
    enable_wallpaper = true
    resize_method = "display-update"
    color_depth = 24
  }
}

resource "guacamole_user" "user" {
  count = var.participant_count
  username = "${var.event_name}-${format("%02d", count.index + 1)}"
  password = "geheim"
  attributes {
    full_name = "Schulungsteilnehmer ${format("%02d", count.index + 1)}"
    timezone = "Europe/Berlin"
  }
  connections = [ 
    guacamole_connection_rdp.connection[count.index].id 
  ]
}


