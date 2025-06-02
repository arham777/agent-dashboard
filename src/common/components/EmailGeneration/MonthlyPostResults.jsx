export default function MonthlyPostResults() {
  const mailData = [
    { type: "Initial Mail", subject: "🎨 Master UI/UX Design — Free Online Workshop This Month!",color:"#007BFF" },
    { type: "Follow Up Mail", subject: "🎨 Master UI/UX Design — Free Online Workshop This Month!",color:'#FFA500' },
    { type: "Confirmation Mail", subject: "🎨 Master UI/UX Design — Free Online Workshop This Month!",color:'#16A34A' },
    { type: "Notification Mail", subject: "🎨 Master UI/UX Design — Free Online Workshop This Month!",color:'#17A2B8' },
  ];

  const MailCard = ({ type, subject, isHighlighted = false, color }) => (
    <div className={`mb-6  rounded-lg  ${isHighlighted ? 'border-blue-500' : 'border-gray-200'} bg-white`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-md font-medium  text-[${color}]`}>{type}</h3>
        <span className="text-xs text-gray-500">Monday: 01 March 2025</span>
      </div>
      <div className="text-sm border p-4 rounded-lg">
        <p className="font-medium text-gray-700 mb-2">Subject Line:</p>
        <p className="text-gray-600">{subject}</p>
        <a href="#" className="text-sm mt-2 inline-block">See More....</a>
      </div>
    </div>
  );

  return (
    <div className="max-h-[500px] overflow-auto py-4">
      <p className="text-sm font-sm text-[#777777] mb-4">
        Here is your desired posts on monthly basis.
      </p>

      <div className="space-y-4">
        {mailData.map((mail, index) => (
          <MailCard
            key={index}
            type={mail.type}
            subject={mail.subject}
            color={mail.color}
            isHighlighted={mail.type === "Confirmation Mail"}
          />
        ))}
      </div>
    </div>
  );
}