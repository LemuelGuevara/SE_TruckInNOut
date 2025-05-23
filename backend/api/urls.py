from django.contrib.auth.views import (
    PasswordResetCompleteView,
    PasswordResetConfirmView,
    PasswordResetDoneView,
    PasswordResetView,
)
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    AdministratorDetailView,
    AdministratorListView,
    EmployeeCreateView,
    EmployeeDetailView,
    EmployeeListView,
    LoginView,
    RegisterTripView,
    RegisterUserView,
    RegisterVehicleView,
    ResetPasswordView,
    SalaryDetailView,
    SalaryListView,
    SendPasswordLinkView,
    TotalViewSet,
    TripDetailAPIView,
    TripDetailView,
    TripListView,
    UserListView,
    UserProfileView,
    ValidateResetPasswordTokenView,
    VehicleListView,
    calculate_totals,
    change_password,
    completed_trips_view,
    current_user_employee,
    delete_user_by_username,
    delete_vehicle_by_plate,
    distribute_deductions,
    employee_trip_salaries,
    generate_gross_payroll_pdf,
    generate_salary_breakdown_pdf,
    get_all_salary_configurations,
    get_completed_trips_salaries,
    get_employee_location,
    get_employee_profile,
    get_employees,
    get_ongoing_trips,
    get_recent_trips,
    get_salary_config,
    get_user_trip_data,
    ongoing_trips,
    priority_queue_view,
    reset_completed_trip_counts,
    set_payment_status,
    trips_by_date_range,
    update_completed_status,
    update_employee_location,
    update_employee_profile,
    update_salaries,
    update_salary_deductions,
    update_trip,
    update_user_data,
    update_user_profile,
    generate_salary_breakdown_pdf_emp,
)

urlpatterns = [
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/profile/", UserProfileView.as_view(), name="user-profile-view"),
    path(
        "users/profile/update/<int:user_id>/",
        update_user_profile,
        name="user-profile-update-view",
    ),
    path("employees/create/", EmployeeCreateView.as_view(), name="employee-create"),
    path("employees/", EmployeeListView.as_view(), name="employee-list"),
    path("employees/<int:pk>/", EmployeeDetailView.as_view(), name="employee-detail"),
    path("employee/update-profile/", update_employee_profile, name="update-profile"),
    path("employees/profile/", get_employee_profile, name="get-employee-profile"),
    path("admins/", AdministratorListView.as_view(), name="admin-list"),
    path("admins/<int:pk>/", AdministratorDetailView.as_view(), name="admin-detail"),
    path("salaries/", SalaryListView.as_view(), name="salary-list"),
    path("salaries/<int:pk>/", SalaryDetailView.as_view(), name="salary-detail"),
    # Trip Assignment
    path("trips/recent/", get_recent_trips, name="get-recent-trips"),
    path("trips/ongoing/", get_ongoing_trips, name="get-ongoing-trips"),
    path("trips/", TripListView.as_view(), name="trip-list"),
    path("trips/<int:pk>/", TripDetailView.as_view(), name="trip-detail"),
    # Trip Checking
    path(
        "trips/by-trip-id/<int:trip_id>/",
        TripDetailAPIView.as_view(),
        name="trip-by-tripid",
    ),
    # JWT Authentication Routes
    path("login/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="logout"),
    # Generate PDF
    path("employee-trip-salaries/", employee_trip_salaries),
    path(
        "generate-pdf/gross-salary-breakdown/",
        generate_gross_payroll_pdf,
        name="generate_gross_payroll_pdf",
    ),
    path(
        "generate-pdf/salary-breakdown/",
        generate_salary_breakdown_pdf,
        name="generate_salary_breakdown_pdf",
    ),
    # Add Account
    path("register/", RegisterUserView.as_view(), name="register"),
    # Add Vehicle
    path("register-vehicle/", RegisterVehicleView.as_view(), name="create_vehicle"),
    # Add Trip
    path("register-trip/", RegisterTripView.as_view(), name="create_trip"),
    # Password Reset
    path("password-reset/", SendPasswordLinkView.as_view(), name="password_reset"),
    path(
        "password-reset-confirm/<str:token>/",
        ResetPasswordView.as_view(),
        name="password_reset_confirm",
    ),
    path(
        "password-reset/validate/",
        ValidateResetPasswordTokenView.as_view(),
        name="password-reset-validate/",
    ),
    # CREATE NEW TRIP GET VEHICLES
    path("vehicles/", VehicleListView.as_view(), name="vehicle_list"),
    # CREATE NEW TRIP GET EMPLOYEES
    path("employees/", get_employees, name="get_employees"),
    # Delete User
    path(
        "delete-user-by-username/<str:username>/",
        delete_user_by_username,
        name="delete-user-by-username",
    ),
    path(
        "update-salary-deductions/",
        update_salary_deductions,
        name="update_salary_deductions",
    ),
    # PRIORITY QUEUE
    path("priority-queue/", priority_queue_view),
    # Delete Vehicles
    path(
        "delete-vehicle-by-plate/<str:plate_number>/",
        delete_vehicle_by_plate,
        name="delete-vehicle-by-plate",
    ),
    # Totals
    path("totals/", TotalViewSet.as_view({"get": "list", "post": "create"})),
    path(
        "totals/<int:pk>/", TotalViewSet.as_view({"get": "retrieve", "put": "update"})
    ),
    path("calculate_totals/", calculate_totals, name="calculate-totals"),
    path("completed-trips-salaries/", get_completed_trips_salaries),
    path("trips-by-date-range/", trips_by_date_range, name="trips_by_date_range"),
    # Map tracking
    path(
        "employees/update-location/",
        update_employee_location,
        name="update-employee-location",
    ),
    path(
        "employees/location/<int:employee_id>/",
        get_employee_location,
        name="get_employee_location",
    ),
    path("completed-trips/", completed_trips_view, name="completed-trips"),
    path("distribute-deductions/", distribute_deductions),
    path("update-salaries/", update_salaries),
    path(
        "generate-pdf/gross-preview/",
        generate_gross_payroll_pdf,
        name="generate_gross_payroll_pdf",
    ),
    path("set-payment-status/", set_payment_status, name="set-payment-status"),
    path("user/<int:pk>/update/", update_user_data, name="update_user"),
    path("get-user-trip-data/", get_user_trip_data, name="get_user_trip_data"),
    path("user/", current_user_employee),
    path(
        "trips/update-completed/",
        update_completed_status,
        name="update-completed-status",
    ),
    path(
        "employees/reset-completed-trips/",
        reset_completed_trip_counts,
        name="reset_completed_trip_counts",
    ),
    path("ongoing-trips/", ongoing_trips, name="ongoing-trips"),
    path("salary-config/", get_salary_config, name="salary-config"),
    path("update/trips/<int:trip_id>/", update_trip, name="update_trip"),
    path("change-password/", change_password, name="change-password"),
    path('generate-pdf/salary-breakdown-emp/', generate_salary_breakdown_pdf_emp, name='generate_salary_breakdown_pdf_emp'),
]
