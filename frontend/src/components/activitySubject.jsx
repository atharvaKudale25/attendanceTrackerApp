import "../css/activitySubject.css";

function ActivitySubject({ subjectId, subjectName, attendedCount, absentCount }) {

    return (
        <div className="activitySubjectCard">
            <div className="activitySubjectHeader">
                <div className="activitySubjectName">
                    {subjectName}
                </div>
                <div className="activitySubjectMessage">
                    {attendedCount === 0 && absentCount === 0
                        ? "Subject was created."
                        : "Attendance updated for this subject on this day."}
                </div>
            </div>

            <div className="activitySubjectCounts">
                <div className="activitySubjectCountBox">
                    <div className="activitySubjectCountLabel">
                        Attended
                    </div>
                    <div className={`activitySubjectCountValue ${attendedCount < 0 ? "activitySubjectNegative" : attendedCount > 0 ? "activitySubjectPositive" : "activitySubjectZero"}`}>
                        {attendedCount > 0 ? `+${attendedCount}` : attendedCount}
                    </div>
                </div>

                <div className="activitySubjectCountBox">
                    <div className="activitySubjectCountLabel">
                        Absent
                    </div>
                    <div className={`activitySubjectCountValue ${absentCount < 0 ? "activitySubjectNegative" : absentCount > 0 ? "activitySubjectPositive" : "activitySubjectZero"}`}>
                        {absentCount > 0 ? `+${absentCount}` : absentCount}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActivitySubject