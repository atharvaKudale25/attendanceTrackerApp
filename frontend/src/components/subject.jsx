import { useState } from 'react'
import { IoMdAdd } from "react-icons/io";
import { RiSubtractLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import '../css/subject.css'
import { Navigate, useNavigate } from "react-router-dom";

function Subject({ subjectId, subjectName, attended, absent, handleManualChange, handleDelete, criteria, disable }) {

    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_baseUrl;
    const user = JSON.parse(localStorage.getItem('user'));

    //message part--------------------------------
    const total = attended + absent;
    let percentage = 0;
    let message = "";
    let percentageClass = "danger";

    if (total === 0) {
        message = "No classes have been recorded yet.";
        percentageClass = "warning";
    }
    else {
        percentage = (attended / total) * 100;

        if (criteria === 0) {
            message = "No attendance target has been set.";
            percentageClass = "good";
        }
        else if (criteria === 100) {

            if (absent === 0) {
                message = "Perfect attendance maintained.";
                percentageClass = "good";
            } else {
                message = "100% attendance is no longer possible.";
                percentageClass = "danger";
            }

        }
        else if (percentage >= criteria) {

            const maxSkips =
                Math.floor(attended / (criteria / 100) - total);

            if (maxSkips === 0)
                message = "You can't skip the next class.";
            else if (maxSkips === 1)
                message = "You can skip at most 1 more class.";
            else
                message = `You can skip at most ${maxSkips} more classes.`;

            percentageClass = "good";
        }
        else {

            const required =
                Math.ceil(
                    (criteria * total - 100 * attended) /
                    (100 - criteria)
                );

            if (required === 1)
                message = "Attend the next class to reach the target.";
            else
                message = `Attend the next ${required} classes to reach ${criteria}%.`;

            percentageClass = "danger";
        }

        if (percentage >= criteria - 5 && percentage < criteria) {
            percentageClass = "warning";
        }
    }
    //message part end--------------------------------


    return (
        <>
            <div className="subjectContainer">
                <div className="subject">

                    <div className="editDiv" onClick={() => navigate(`/edit/${subjectId}`)}>
                        <FaEdit className='editIcon' />
                    </div>

                    <div className="deleteDiv" onClick={() => { if (!disable) handleDelete(subjectId) }}>
                        <MdDelete className='deleteIcon' />
                    </div>

                    <div className="subjectInfo">
                        <div className="subjectNameDiv">
                            {subjectName}
                        </div>

                        <div className="message">
                            {message}
                        </div>
                    </div>

                    <div className="attendedDiv">
                        <div className="attendedText">Attended</div>

                        <div className="attendedInfoDiv">
                            <div
                                className="subIconDiv"
                                onClick={() => { if (!disable) handleManualChange(subjectId, "attended", "decrease") }}
                            >
                                <RiSubtractLine className="subIcon" />
                            </div>

                            <div className="attendedNo">{attended}</div>

                            <div
                                className="addIconDiv"
                                onClick={() => { if (!disable) handleManualChange(subjectId, "attended", "increase") }}
                            >
                                <IoMdAdd className="addIcon" />
                            </div>
                        </div>
                    </div>

                    <div className="absentDiv">
                        <div className="absentText">Absent</div>

                        <div className="absentInfoDiv">
                            <div
                                className="subIconDiv"
                                onClick={() => { if (!disable) handleManualChange(subjectId, "absent", "decrease") }}
                            >
                                <RiSubtractLine className="subIcon" />
                            </div>

                            <div className="absentNo">{absent}</div>

                            <div
                                className="addIconDiv"
                                onClick={() => { if (!disable) handleManualChange(subjectId, "absent", "increase") }}
                            >
                                <IoMdAdd className="addIcon" />
                            </div>
                        </div>
                    </div>

                    <div className="infoOfAttendanceDiv">
                        <div className={`percentage ${percentageClass}`}>
                            {total === 0 ? "--" : `${percentage.toFixed(2)}%`}
                        </div>

                        <div className="criteria">
                            🎯 {criteria.toFixed(2)}%
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Subject