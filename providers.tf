terraform {
  required_providers {
    guacamole = {
      source = "techBeck03/guacamole"
      version = ">= 1.2.7"
    }
  }
}

provider "guacamole" {
  url      = var.guac_url
  username = var.guac_username
  password = var.guac_password
  disable_tls_verification = true
}
