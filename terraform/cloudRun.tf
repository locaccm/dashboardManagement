module "cloud_run_dashboardManagement" {
  source                = "./modules/cloud_run"
  project_id            = "intricate-pad-455413-f7"
  region                = "europe-west1"
  service_name          = "dashboardManagement"
  repository_id         = "locaccm-repo-docker"
  service_account_email = module.service_account_dashboardManagement.email
  vpc_connector         = module.vpc_connector.id
  public                = false

  env_variables = {
    NODE_ENV = "production"
  }
}

module "cloud_run_dashboardManagement_invokers" {
  depends_on = [module.cloud_run_dashboardManagement]
  source        = "./modules/cloud_run_invoker"
  region        = "europe-west1"
  service_name  = "dashboardmanagement-service"
  invokers = {
    frontend            = "frontend-service@intricate-pad-455413-f7.iam.gserviceaccount.com"
    authentification    = "auth-service@intricate-pad-455413-f7.iam.gserviceaccount.com"
  }
}