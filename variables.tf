variable "guac_url" {}
variable "guac_username" {}
variable "guac_password" {}


variable "event_name" { 
  description = "Event name - used for VM, connection, user name" 
  type = string 
}


variable "participant_count" {
  description = "Number of participants"
  type        = number
  default     = 10
}
