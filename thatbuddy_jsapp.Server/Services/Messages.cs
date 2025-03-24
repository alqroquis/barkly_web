using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Xml.Linq;

namespace thatbuddy_jsapp.Server.Services
{
    public static class MessageHelper
    {
        public static string GetMessageText(Messages message)
        {
            var fieldInfo = message.GetType().GetField(message.ToString());
            var attribute = fieldInfo?.GetCustomAttribute<DisplayAttribute>();
            return attribute?.Name ?? "Произошла ошибка. Повторите действие позднее.";
        }
    }

    public enum Messages
    {
        // Общие ошибки
        [Display(Name = "Произошла ошибка. Повторите действие позднее.")]
        UnknownError = 1000,

        [Display(Name = "Пользователь не аутентифицирован.")]
        UserNotAuthenticated = 1001,

        [Display(Name = "Токен недействителен или отсутствует.")]
        InvalidOrMissingToken = 1002,

        [Display(Name = "Пользователь не найден.")]
        UserNotFound = 1003,

        [Display(Name = "Некорректный формат идентификатора пользователя.")]
        InvalidUserIdFormat = 1004,

        [Display(Name = "Доступ к записи ограничен")]
        AccessDenied = 1005,

        // Ошибки пагинации
        [Display(Name = "Некорректные параметры пагинации.")]
        InvalidPaginationParameters = 2001,

        // Ошибки базы данных
        [Display(Name = "Ошибка при выполнении запроса к базе данных.")]
        DatabaseError = 3001,

        // Ошибки валидации
        [Display(Name = "Некорректные входные данные.")]
        InvalidInputData = 4001,

        // Ошибки связанные с питомцем
        [Display(Name = "В бесплатной подписке невозможно добавить больше 10 питомцев")]
        TooManyPetsForUser = 5001,

        [Display(Name = "Питомец с таким идентификатором не найден")]
        PetNotFound = 5002,

        [Display(Name = "Список питомцев пуст")]
        PetsNotFound = 5003,

        [Display(Name = "У питомца еще нет медкарты")]
        MedCardNotFound = 5004,
    }
}
