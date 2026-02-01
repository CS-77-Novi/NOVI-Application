import React from "react";

interface Member {
  id: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
}

interface MembersProps {
  members: Member[];
}

const Members: React.FC<MembersProps> = ({ members }) => {
  return (
    <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        Participants
      </h2>

      {members.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No participants yet
        </p>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <img
                  src={member.avatar || "/assets/default-avatar.png"}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {member.isHost && (
                  <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    H
                  </span>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {member.name}
                </p>

                {member.isHost && (
                  <p className="text-xs text-indigo-500 dark:text-indigo-300">
                    Host
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Members;