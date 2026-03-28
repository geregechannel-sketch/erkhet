package store

import "strings"

type supportAutoReply struct {
	ActorLabel string
	Message    string
}

func normalizeSupportLocale(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "en":
		return "en"
	case "ru":
		return "ru"
	case "zh", "zh-cn", "cn":
		return "zh"
	default:
		return "mn"
	}
}

func localizedSupportAutoReply(locale, supportType string) supportAutoReply {
	switch normalizeSupportLocale(locale) {
	case "en":
		return supportAutoReply{ActorLabel: "Auto responder", Message: englishSupportAutoReply(supportType)}
	case "ru":
		return supportAutoReply{ActorLabel: "Автоответ", Message: russianSupportAutoReply(supportType)}
	case "zh":
		return supportAutoReply{ActorLabel: "自动回复", Message: chineseSupportAutoReply(supportType)}
	default:
		return supportAutoReply{ActorLabel: "Автомат хариу", Message: mongolianSupportAutoReply(supportType)}
	}
}

func mongolianSupportAutoReply(supportType string) string {
	switch supportType {
	case "complaint":
		return "Таны гомдлыг хүлээн авлаа. Манай баг яаралтай бүртгэж авсан бөгөөд боломжит хамгийн ойрын хугацаанд танд эргэн холбогдоно."
	case "feedback":
		return "Таны санал хүсэлтийг хүлээн авлаа. Бид үйлчилгээний чанараа сайжруулахдаа таны илгээсэн мэдээллийг ашиглана."
	default:
		return "Таны хүсэлтийг хүлээн авлаа. Манай оператор тун удахгүй тантай эргэн холбогдоно."
	}
}

func englishSupportAutoReply(supportType string) string {
	switch supportType {
	case "complaint":
		return "We have received your complaint. Our team has logged it with priority and will contact you as soon as possible."
	case "feedback":
		return "We have received your feedback. Thank you for helping us improve our service."
	default:
		return "We have received your request. A member of our team will contact you shortly."
	}
}

func russianSupportAutoReply(supportType string) string {
	switch supportType {
	case "complaint":
		return "Мы получили вашу жалобу. Наша команда уже зарегистрировала её в приоритетном порядке и свяжется с вами в ближайшее время."
	case "feedback":
		return "Мы получили ваш отзыв. Спасибо, что помогаете нам улучшать качество сервиса."
	default:
		return "Мы получили ваш запрос. Сотрудник нашей команды свяжется с вами в ближайшее время."
	}
}

func chineseSupportAutoReply(supportType string) string {
	switch supportType {
	case "complaint":
		return "我们已收到您的投诉。团队已优先登记，并会尽快与您联系。"
	case "feedback":
		return "我们已收到您的反馈。感谢您帮助我们持续改进服务。"
	default:
		return "我们已收到您的请求，我们的工作人员将尽快与您联系。"
	}
}
