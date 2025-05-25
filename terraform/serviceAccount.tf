module "service_account_dashboardManagement" {
  source       = "./modules/service_account"
  account_id   = "dashboardmanagement-service"
  display_name = "Dashboard Management Service Account"
  project_id   = "intricate-pad-455413-f7"
  roles        = [
    "roles/cloudsql.client",
  ]
}